import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';
export const icons: { [key: string]: SvgIcon } = {};
export const fileTypes = [
    'Archive',
    'Audio',
    'EPF',
    'ERF',
    'Excel',
    'GEO',
    'GRS',
    'HTML',
    'Image',
    'MXL',
    'ODC',
    'ODF',
    'ODG',
    'ODS',
    'ODT',
    'PDF',
    'PowerPoint',
    'Text',
    'Unknown',
    'Video',
    'Word'
];
for (const e of fileTypes) {
    // tslint:disable-next-line:no-var-requires non-literal-require
    icons[e] = require(`images/_fileType${e}.svg`);
}
