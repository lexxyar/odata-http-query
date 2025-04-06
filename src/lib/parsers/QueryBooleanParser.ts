import {QueryParser} from "./QueryParser";

export class QueryBooleanParser extends QueryParser<boolean> {

    parse(value: string): boolean {
        if (value === '') {
            return false
        }
        return value.toLowerCase() === 'true'
    }
}
