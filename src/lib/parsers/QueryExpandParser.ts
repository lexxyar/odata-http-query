import {QueryParser} from "./QueryParser";
import {QueryExpand} from "../QueryExpand";

export class QueryExpandParser extends QueryParser<QueryExpand[]> {
    private _expand: QueryExpand[] = []

    public parse(value: string): QueryExpand[] {
        if (value === '') {
            return []
        }

        value.split(',').map((field: string): void => {
            const expression: string = field.trim()
            const exp: QueryExpand = QueryExpand.make()

            if (expression.substring(expression.length - 1) === ')') {
                const parts: string[] = expression.split('(')
                exp.entity(parts[0])
                exp.withCount()
            } else {
                exp.entity(expression)
            }
            this.addExpand(field.trim())
        })

        return this._expand
    }

    public addExpand(entity: string | string[] | QueryExpand | QueryExpand[], count: boolean = false): this {
        if (Array.isArray(entity)) {
            entity.map((entityName: string | QueryExpand): void => {
                if (typeof entityName === 'string') {
                    this._expand.push(QueryExpand.make(entityName, count))
                } else {
                    this._expand.push(entityName)
                }
            })
        } else {
            if (typeof entity === 'string') {
                this._expand.push(QueryExpand.make(entity, count))
            } else {
                this._expand.push(entity)
            }
        }
        return this
    }
}
