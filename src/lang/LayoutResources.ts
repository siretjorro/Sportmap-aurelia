export interface ILayoutResourceStrings {
    language: string;
}
export interface ILayoutResources {
    'en-GB': ILayoutResourceStrings;
    'et-EE': ILayoutResourceStrings;
    'ru-RU': ILayoutResourceStrings;
}
export const LayoutResources: ILayoutResources = {
    'en-GB':{
        language: 'Language',
    },
    'et-EE': {
        language: 'Keel',
    },
    'ru-RU': {
        language: 'Jazyk',
    } 
}
