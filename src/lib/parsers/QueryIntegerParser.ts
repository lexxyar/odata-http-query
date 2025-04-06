import {QueryParser} from "./QueryParser";

export class QueryIntegerParser extends QueryParser<number> {
    parse(value: string): number {
        return +value
    }
}
