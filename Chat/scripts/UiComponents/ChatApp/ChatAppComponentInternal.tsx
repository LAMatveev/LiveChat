import * as userFillRoundPicture from 'images/_userFillRound.svg';
import { IValueDidChange, action } from 'mobx';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatConversationsPageComponent } from 'scripts/UiComponents/ChatConversationsPage/ChatConversationsPageComponent';
import { ChatLoadingPageComponent } from 'scripts/UiComponents/ChatLoadingPage/ChatLoadingPageComponent';

import { ECSInitParams, ECSIntegrationCreateParam } from '@1c/ecs.js';
import { isSilentException } from '@1c/g5-client-base/Base/Core/Exception/SilentException';
import { Throwable } from '@1c/g5-client-base/Base/Core/Exception/Throwable';
import { NullUUIDString } from '@1c/g5-client-base/Base/Core/UUID';
import { isInterfaceMobile } from '@1c/g5-client-base/Base/Env/interfaceKind';
import { ecsManager } from '@1c/g5-client-base/Ecs/Model/EcsManager/EcsManager';
import { G5EcsUser } from '@1c/g5-client-base/Ecs/Model/G5EcsUser';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import * as globeUserRoundPicture from '@1c/g5-client-base/Ecs/images/_globeUserRound.svg';
import * as userDoubleFillRoundPicture from '@1c/g5-client-base/Ecs/images/_userDoubleFillRound.svg';
import { getConfig } from '@1c/g5-client-base/Site/scripts/Config';
import { kUrlSearchParamsKey } from '@1c/g5-client-base/Site/scripts/UiComponents/ConversationsPage/ConversationsPageComponentInternal';
import { DisconnectedPageComponent } from '@1c/g5-client-base/Site/scripts/UiComponents/DisconnectedPage/DisconnectedPageComponent';
import { AppComponent } from '@1c/g5-client-base/UiComponents/App/AppComponent';
import { IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';
import { Constructor } from '@1c/g5-client-base/Utils/Constructor';
import { Locale } from '@1c/g5-client-i18n';

/** Страницы */
export enum PageRoute {
    CONVERSATIONS = 'conversations',
    DISCONNECTED = 'disconnected',
    LOADING = ''
}

const routes: Record<PageRoute, Constructor<UiComponent>> = {
    [PageRoute.CONVERSATIONS]: ChatConversationsPageComponent,
    [PageRoute.DISCONNECTED]: DisconnectedPageComponent,
    [PageRoute.LOADING]: ChatLoadingPageComponent
};

/** Компонент приложения системы взаимодействия  */
export class ChatAppComponentInternal extends AppComponent {
    private userSettings: ECSIntegrationCreateParam = { integrationId: '' };

    constructor(owner: IUiComponentsOwner) {
        super(owner);
        ChatAppComponentInternal.queryParamsProcessing();
        const urlParams = new URLSearchParams(sessionStorage.getItem(kUrlSearchParamsKey) || '');
        this.userSettings.integrationId = urlParams.get('integrationId') || '';
        PostMessageObserverService.currentMessageEvent.observe(this.parseChatMessage);
        const languageCode = urlParams.get('languageCode') || 'en';
        this.changeLanguage(languageCode);
        this.init();
    }

    @action
    public changeRoute(pageRoute: PageRoute): void {
        switch (pageRoute) {
            case PageRoute.LOADING:
            case PageRoute.CONVERSATIONS:
                if (!ecsManager.isConnected()) {
                    pageRoute = PageRoute.DISCONNECTED;
                }
                break;
            default:
                if (ecsManager.isAuthenticated()) {
                    pageRoute = PageRoute.CONVERSATIONS;
                }
                break;
        }
        const rootComponent = this.getProperty('rootComponent');
        if (rootComponent) {
            rootComponent.dispose();
        }
        this.setProperty('rootComponent', this.getRouteComponent(pageRoute));
    }

    /** @override */
    public dispose() {
        super.dispose();
        PostMessageObserverService.unmount();
    }

    protected static queryParamsProcessing(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const titleBackColor = urlParams.get('titleBackColor');
        const titleTextColor = urlParams.get('titleTextColor');
        document.documentElement.setAttribute(
            'style',
            (titleBackColor ? `--CHAT_HEADER_BACKGROUND_COLOR:  ${titleBackColor};` : '') +
                (titleTextColor ? `--CHAT_HEADER_TEXT_COLOR:  ${titleTextColor};` : '')
        );
        const theme = urlParams.get('colorTheme');
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        const displayUserPictures = urlParams.get('displayUserPictures');
        if (displayUserPictures !== 'true') {
            document.body.classList.add('ecs-chat-avatar-hide');
        }
        sessionStorage.setItem(kUrlSearchParamsKey, urlParams.toString());
    }

    protected static getRouteComponentCtor(pageRoute: PageRoute): Constructor<UiComponent> {
        return routes[pageRoute] || routes[PageRoute.LOADING];
    }

    protected static getEcsInitParams(): ECSInitParams {
        return {
            defaultConversation: {
                picture: userDoubleFillRoundPicture,
                integrationPicture: globeUserRoundPicture
            },
            defaultUser: {
                presentation: '',
                picture: userFillRoundPicture
            }
        };
    }

    protected UnicodeTOBCP(languageCode: string) {
        return languageCode.replace('_', '-').replace('root', 'und');
    }

    protected changeLanguage(languageCode: string) {
        const language = languageCode.substr(0, 2);
        switch (language) {
            case 'en':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'en-US');
                break;
            case 'ru':
                require.ensure(
                    ['@1c/g5-client-base/Ecs/i18n/ru'],
                    () => {
                        import(`@1c/g5-client-base/Ecs/i18n/ru`).then((res) => {
                            this.changeLanguageInternal(
                                language,
                                this.UnicodeTOBCP(languageCode),
                                res.default,
                                'ru-RU'
                            );
                        });
                    },
                    undefined,
                    'ru'
                );
                break;
            default:
                this.changeToUnsupportedLanguage(languageCode);
        }
    }

    // tslint:disable-next-line:no-any
    protected changeLanguageInternal(language: string, locale: string, dict?: any, defaultLocale?: string) {
        if (locale.length === 2 && defaultLocale) {
            locale = defaultLocale;
        }
        if (!i18n.languages.includes(language)) {
            i18n.addResources(language, 'translation', dict);
        }

        if (i18n.language !== language) {
            i18n.changeLanguage(language);
            document.documentElement.setAttribute('dir', i18n.dir(language));
        }

        if (Locale.getDefault().toString() !== locale) {
            Locale.setDefault(new Locale(locale));
        }
    }

    // tslint:disable-next-line:max-func-body-length
    protected changeToUnsupportedLanguage(languageCode: string) {
        const language = languageCode.substr(0, 2);
        switch (language) {
            case 'az':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'az-AZ');
                break;
            case 'ar':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'ar-AE');
                break;
            case 'hy':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'hy-AM');
                break;
            case 'bg':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'bg-BG');
                break;
            case 'hu':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'hu-HU');
                break;
            case 'vi':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'vi-VN');
                break;
            case 'el':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'el-GR');
                break;
            case 'ka':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'ka-GE');
                break;
            case 'es':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'es-ES');
                break;
            case 'it':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'it-IT');
                break;
            case 'kk':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'kk-KZ');
                break;
            case 'zh':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'zh-CN');
                break;
            case 'lv':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'lv-LV');
                break;
            case 'lt':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'lt-LT');
                break;
            case 'de':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'de-DE');
                break;
            case 'pl':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'pl-PL');
                break;
            case 'ro':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'ro-RO');
                break;
            case 'tr':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'tr-TR');
                break;
            case 'tk':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'tk-TK');
                break;
            case 'uk':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'uk-UA');
                break;
            case 'fr':
                this.changeLanguageInternal(language, this.UnicodeTOBCP(languageCode), undefined, 'fr-FR');
                break;
            default:
                this.changeLanguageInternal('en', 'en-US');
        }
    }

    /** @override */
    protected afterCreate(): void {
        super.afterCreate();
        if (localStorage.getItem('TOKEN')) {
            if (!ecsManager.isConnected()) {
                this.startEcs();
            } else if (!ecsManager.isAuthenticated()) {
                ecsManager.stop();
                this.startEcs();
            }
        }
        const fontSizePX = parseFloat(getComputedStyle(document.body).fontSize);
        PostMessageObserverService.sendMessage('initialized', {
            width: fontSizePX * 25,
            height: parseFloat(localStorage.getItem('chatHeight') || '500'),
            offsetLeft: parseFloat(localStorage.getItem('chatOffsetLeft') || '-1'),
            headerWidth: fontSizePX * 15,
            headerHeight: fontSizePX * 2.4,
            beforeUnloadMessage: i18n.t('IDS_EXIT_MESSAGE')
        });
        PostMessageObserverService.mount();
    }

    protected getRouteComponent(pageRoute: PageRoute): UiComponent {
        return this.createOwnComponent(ChatAppComponentInternal.getRouteComponentCtor(pageRoute));
    }

    protected startEcs(): void {
        ecsManager.initECSParams(ChatAppComponentInternal.getEcsInitParams());
        ecsManager.onDisconnected.on(this.onDisconnected);

        ecsManager.onConnected.on(this.onConnected);

        getConfig().then((config) => {
            return ecsManager.connect(config.serverURL);
        });
    }

    protected authenticate() {
        const cookie = localStorage.getItem('TOKEN');
        if (cookie) {
            this.userSettings.token = cookie;
            this.authByCookie(cookie);
        } else {
            this.tryAuthenticate();
        }
    }

    protected authenticated = async (): Promise<void> => {
        ecsManager.start().then(() => {
            // Показываем страницу обсуждений
            this.changeRoute(PageRoute.CONVERSATIONS);
        });
    };

    protected onConnected = (): void => {
        this.authenticate();
    };

    /** @override */
    protected createOwnRoot(): UiComponent {
        return this.getRouteComponent(PageRoute.LOADING);
    }

    @action
    protected handleUnhandledError(err: Error | Throwable): void {
        if (isSilentException(err)) {
            return;
        }
        let message = err instanceof Throwable ? err.getMessage() : err.message;
        // tslint:disable-next-line:no-console
        console.log(message);
    }

    @action // tslint:disable-next-line:max-func-body-length
    private parseChatMessage = (e: IValueDidChange<MessageEvent | null>) => {
        const ev = e.newValue;
        if (ev) {
            const data = ev.data;
            switch (data.message) {
                case 'open':
                    document.body.classList.remove('ecs-chat-hide');
                    if (!ecsManager.isConnected()) {
                        this.startEcs();
                    } else if (!ecsManager.isAuthenticated()) {
                        ecsManager.stop();
                        this.startEcs();
                    }
                    break;
                case 'close':
                    document.body.classList.add('ecs-chat-hide');
                    break;
                case 'logout':
                    localStorage.removeItem('TOKEN');
                    localStorage.removeItem('urlLocation');
                    localStorage.removeItem('titleLocation');
                    PostMessageObserverService.respondMessage(ev, 'logoutOK');
                    break;
                case 'setContactInfo':
                    this.userSettings.phone = data.data.phone || this.userSettings.phone;
                    this.userSettings.email = data.data.email || this.userSettings.email;
                    this.userSettings.fullName = data.data.fullName || this.userSettings.fullName;
                    this.userSettings.name = data.data.name || this.userSettings.name;
                    if (ecsManager.isAuthenticated()) {
                        ecsManager.createOrUpdateIntegrationUserP(this.userSettings).then((res) => {
                            localStorage.setItem('TOKEN', res);
                            this.userSettings.token = res;
                        });
                    }
                    break;
                case 'setMatchingKeyToken':
                    this.userSettings.matchingKeyToken = data.data.matchingKeyToken;
                    if (ecsManager.isAuthenticated()) {
                        this.tryAuthenticate();
                    }
                    break;
                case 'getContactInfo':
                    if (!ev.ports[0]) {
                        return;
                    }
                    const user = G5EcsUser.get(ecsManager.getCurrentUserId());
                    ev.ports[0].postMessage({
                        message: 'getContactInfoOK',
                        data: {
                            name: user.getName(),
                            email: user.getEmail(),
                            phone: user.getPhone(),
                            fullName: user.getFullName()
                        }
                    });
                    break;
            }
        }
    };

    private tryAuthenticate() {
        ecsManager.createOrUpdateIntegrationUserP(this.userSettings).then(
            (res) => {
                this.authInternal(res);
            },
            () => {
                ecsManager.createOrUpdateIntegrationUser(this.userSettings.integrationId.toString()).then((res) => {
                    this.authInternal(res);
                });
            }
        );
    }

    private authInternal(res: string) {
        localStorage.setItem('TOKEN', res);
        this.userSettings.token = res;
        this.authByCookie(res);
    }

    private authByCookie(cookie: string) {
        ecsManager
            .authenticate({
                authType: 'TOKEN',
                token: cookie
            })
            .then((_) => {
                if (ecsManager.getCurrentUserId() !== NullUUIDString) {
                    this.authenticated().then();
                }
            });
    }

    private init(): void {
        document.title = i18n.t('IDS_TITLE');
        if (isInterfaceMobile) {
            document.body.classList.add('mobile');
        }
    }

    private onDisconnected = (): void => {
        ecsManager.stop();

        // Показываем страницу потери соединения с сервером системы взаимодействия
        this.changeRoute(PageRoute.DISCONNECTED);
    };
}
