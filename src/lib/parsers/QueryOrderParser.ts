import {QueryParser} from "./QueryParser";
import {QueryOrder} from "../QueryOrder";
import {TQueryOrderDirection} from "../../types";

export class QueryOrderParser extends QueryParser<QueryOrder[]> {
    private _order: QueryOrder[] = []

    parse(value: string): QueryOrder[] {
        if (value === '') {
            return []
        }

        value.split(',').map((fieldValue: string) => {
            const orderParts: string[] = fieldValue.trim().split(' ')
            let dir: TQueryOrderDirection = 'asc'
            const field: string = orderParts[0].trim()

            if (orderParts.length === 2) {
                if (orderParts[1].trim().toLowerCase() === 'desc') {
                    dir = 'desc'
                }
            }

            this.addOrder(QueryOrder.make(field, dir))
        })

        return this._order
    }

    private addOrder(order: QueryOrder | string, direction: TQueryOrderDirection | string = 'asc'): this {
        let queryOrder: QueryOrder
        if (order instanceof QueryOrder) {
            queryOrder = order
        } else {
            let dir: TQueryOrderDirection
            dir = direction.toLowerCase() as TQueryOrderDirection
            queryOrder = QueryOrder.make(order, dir)
        }

        const index: number = this._order.findIndex((e: QueryOrder): boolean => e.getField() === queryOrder.getField())
        if (index >= 0) {
            this._order[index] = queryOrder
        } else {
            this._order.push(queryOrder)
        }
        return this
    }
}
