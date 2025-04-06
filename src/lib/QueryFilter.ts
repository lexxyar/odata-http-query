import {TQueryFilterConcatenate, TQueryFilterSign} from "../types";

export class QueryFilter {
    private _field: string = ''
    private _value: string = ''
    private _option: TQueryFilterSign = 'eq'
    private _concat: TQueryFilterConcatenate = 'and'
    private _childFilter: QueryFilter[] = []

    public static make(field: string | QueryFilter = '', value: any = '', option: TQueryFilterSign | string = 'eq', concat: TQueryFilterConcatenate | string | null = null): QueryFilter {
        return new QueryFilter(field, value, option, concat)
    }

    public constructor(field: string | QueryFilter = '', value: any = '', option: TQueryFilterSign | string = 'eq', concat: TQueryFilterConcatenate | string | null = null) {
        if (typeof field === 'string') {
            this._field = field
            this._value = value
            this._option = option.toLowerCase() as TQueryFilterSign
            if (concat !== null) {
                this._concat = concat.toLowerCase() as TQueryFilterConcatenate
            }
        } else {
            this._childFilter.push(field)
        }
    }

    public field(value: string): this {
        this._field = value
        return this
    }

    public getField(): string {
        return this._field
    }

    public getValue(): string {
        return this._value
    }

    public value(value: string): this {
        this._value = value
        return this
    }

    public getOption(): string {
        return this._option
    }

    public getConcat(): TQueryFilterConcatenate {
        return this._concat.toLowerCase() === 'and' ? 'and' : 'or'
    }

    public concat(value: TQueryFilterConcatenate): this {
        this._concat = value as TQueryFilterConcatenate
        return this
    }

    private _add(filter: QueryFilter, concat: TQueryFilterConcatenate = 'and'): void {
        filter.concat(concat)
        this._childFilter.push(filter)
    }

    private _toFilter(field: string, value: any = '', option: TQueryFilterSign = 'eq'): QueryFilter {
        return QueryFilter.make(field, value, option)
    }

    public or(filter: QueryFilter | string, value: any = '', option: TQueryFilterSign = 'eq'): this {
        if (typeof filter === 'string') {
            this._add(this._toFilter(filter, value, option), 'or')
        } else {
            this._add(filter, 'or')
        }
        return this
    }

    public and(filter: QueryFilter | string, value: any = '', option: TQueryFilterSign = 'eq'): this {
        if (typeof filter === 'string') {
            this._add(this._toFilter(filter, value, option), 'and')
        } else {
            this._add(filter, 'and')
        }
        return this
    }

    public addChild(filter: QueryFilter | string, value: any = '', option: TQueryFilterSign = 'eq'): QueryFilter {
        if (typeof filter === 'string') {
            this._add(this._toFilter(filter, value, option), 'and')
        } else {
            this._add(filter, filter.getConcat())
        }
        return this
    }

    public toString(withConcat: boolean = false): string {
        const aFilter = []
        if (this.getField() !== '')
            aFilter.push(this._toString(withConcat))
        this._childFilter.filter((item: QueryFilter): boolean => item.getField() !== '')
            .map((item: QueryFilter): void => {
                if (aFilter.length == 0) {
                    aFilter.push(item.toString(false))
                } else {
                    aFilter.push(item.toString(true))
                }
            })
        return aFilter.join(' ')
    }

    private _toString(withConcat: boolean = false): string {
        if (this._field === '') return ''
        const value: string = `'${this._value}'`
        const aResult: string[] = [this._field, this._option, value]
        if ((['substringof', 'startswith', 'endswith', 'contains'] as TQueryFilterSign[]).findIndex((item: string): boolean => this._option === item) >= 0) {
            aResult[0] = `${this._option}(${this._field}, ${value})`
            aResult[1] = `eq`
            aResult[2] = `true`
        }

        if (withConcat) {
            aResult.unshift(this._concat)
        }
        return aResult.join(' ')
    }
}
