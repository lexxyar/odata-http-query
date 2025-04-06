import {TQueryOrderDirection} from "../types";

export class QueryOrder {
    protected _field: string = ''
    protected _direction: TQueryOrderDirection = 'asc'

    public static make(field: string = '', direction: TQueryOrderDirection = 'asc'): QueryOrder {
        return new QueryOrder(field, direction)
    }

    constructor(field: string = '', direction: TQueryOrderDirection = 'asc') {
        this._field = field
        this._direction = direction
    }

    public field(value: string): this {
        this._field = value
        return this
    }

    public getField(): string {
        return this._field
    }

    public getDirection(): TQueryOrderDirection {
        return this._direction
    }

    public toggleDirection(): this {
        this._direction = this._direction === 'desc' ? 'asc' : 'desc'
        return this
    }

    public asc(value: boolean = true): this {
        this._direction = value ? 'asc' : 'desc'
        return this
    }

    public desc(value: boolean = true): this {
        return this.asc(!value)
    }

    public toString(): string {
        return `${this._field} ${this._direction}`
    }

    public toJson(): object {
        return {field: this._field, direction: this._direction}
    }
}
