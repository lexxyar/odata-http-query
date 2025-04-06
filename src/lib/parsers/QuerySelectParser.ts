import {QueryParser} from "./QueryParser";

export class QuerySelectParser extends QueryParser<string[]> {

    parse(value: string): string[] {
        if (value === '') {
            return []
        }

        const select: string[] = []
        value.split(',').map((field: string): void => {
            select.push(field.trim())
        })
        return select
    }
}
