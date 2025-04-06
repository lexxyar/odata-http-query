import {QueryFilter} from "../QueryFilter";
import {QueryParser} from "./QueryParser";
import type {TQueryFilterConcatenate, TQueryFilterSign} from "../../types";

type TParserFilterStructure = {
    condition: TQueryFilterConcatenate
    field: string
    group: number
    operator: TQueryFilterSign
    value: string
}

export class QueryFilterParser extends QueryParser<QueryFilter[]> {
    protected _filter: QueryFilter[] = []

    public parse(value: string): QueryFilter[] {
        if (value === '') {
            return []
        }

        const matches: TParserFilterStructure[] = this.splitWords(value);

        matches.map((match: any) => {

            if (match.field.toLowerCase().startsWith('substringof') ||
                match.field.toLowerCase().startsWith('contains') ||
                match.field.toLowerCase().startsWith('endswith') ||
                match.field.toLowerCase().startsWith('startswith')) {

                const re: RegExp = /(?<Operator>.+)\(((?<Field>.+),s*'(?<Value>.+)')/gm
                const groups = re.exec(match.field)?.groups
                if (groups) {
                    let val: string = groups.Value
                    if (groups.Value.startsWith("'")) {
                        val = groups.Value.substring(1, groups.Value.length - 1)
                    }
                    const f: QueryFilter = QueryFilter.make(groups.Field, val, groups.Operator)
                    this.addFilter(f);
                }
            } else {
                let val = match.value
                if (match.value.startsWith("'")) {
                    val = match.value.substring(1, match.value.length - 1)
                }
                const f: QueryFilter = QueryFilter.make(match.field, val, match.operator)
                this.addFilter(f);
            }
        })

        return this._filter
    }

    protected getDefaultStructure(): TParserFilterStructure {
        return {
            condition: 'and',
            field: '',
            group: 0,
            operator: 'eq',
            value: ''
        } as TParserFilterStructure
    }

    private splitWords(value: string): TParserFilterStructure[] {
        const words: string[] = value.split(' ')

        const matches: TParserFilterStructure[] = [];
        let quote: number = 0
        let text: string = ''
        let stage: number = 0
        let group: number = 0
        let o: TParserFilterStructure = this.getDefaultStructure()
        for (let i: number = 0; i < words.length; i++) {
            let word: string = words[i]
            text = [text, word].join(' ').trim()
            let regex: RegExp = /'/gi;
            let quoteCount: number = (word.match(regex) || []).length;
            quote += quoteCount;
            if (quote % 2 != 0) continue;

            if (i === 0) {
                stage++
                o = this.getDefaultStructure()
                matches.push(o)
            }

            switch (stage) {
                case 0: // Binary operation
                    o = this.getDefaultStructure()
                    matches.push(o)
                    o.condition = text.toLowerCase() as TQueryFilterConcatenate
                    stage++
                    break
                case 1: // Field
                    if (text.startsWith('(')) {
                        group++;
                        text = text.substring(1)
                    }
                    o.field = text
                    o.group = group
                    stage++
                    break
                case 2: // Sign
                    if (['eq', 'ne', 'lt', 'le', 'gt', 'ge',].includes(text.toLowerCase() as TQueryFilterSign)) {
                        o.operator = text.toLowerCase() as TQueryFilterSign
                        stage++
                    } else {
                        o.field += text
                    }
                    break
                case 3: // Value
                    if (text.endsWith(')')) {
                        group--
                        text = text.substring(0, text.length - 1)
                    }
                    o.value = text
                    stage = 0
                    break
            }

            text = ''
        }

        return matches
    }

    protected addFilter(field: QueryFilter | string, value: any = '', option: TQueryFilterSign | string = 'eq', concat: TQueryFilterConcatenate | string = 'and'): this {
        const newFilter: QueryFilter = (field instanceof QueryFilter)
            ? field
            : QueryFilter.make(field, value, option)

        newFilter.concat(concat.toLowerCase() as TQueryFilterConcatenate)
        this._filter.push(newFilter)

        return this
    }
}
