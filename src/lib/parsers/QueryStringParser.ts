import {QueryParser} from "./QueryParser";

export class QueryStringParser extends QueryParser<string> {

    parse(value: string): string {
        return value.trim()
    }
}
