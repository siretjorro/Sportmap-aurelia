import { ICulture } from './../domain/ICulture';

export interface IState {
    cultures: ICulture[];
    selectedCulture: ICulture;
    jwt?: string;
}

export const initialState: IState = {
    cultures: [],
    selectedCulture: {
        code: 'en-GB',
        name: 'English GB',
    }
}
