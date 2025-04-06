import {QueryExpand} from "./QueryExpand";
import {QueryOrder} from "./QueryOrder";
import {QueryFilter} from "./QueryFilter";
import {QuerySearchParams} from "./QuerySearchParams";
import {IQueryParser, TQueryFilterConcatenate, TQueryFilterSign, TQueryMarkers, TQueryOrderDirection} from "../types";
import {QueryFilterParser} from "./parsers/QueryFilterParser";
import {QueryIntegerParser} from "./parsers/QueryIntegerParser";
import {QuerySelectParser} from "./parsers/QuerySelectParser";
import {QueryStringParser} from "./parsers/QueryStringParser";
import {QueryBooleanParser} from "./parsers/QueryBooleanParser";
import {QueryOrderParser} from "./parsers/QueryOrderParser";
import {QueryExpandParser} from "./parsers/QueryExpandParser";

type TMaybeParser = undefined | IQueryParser
type TQueryMarkerParsers = Record<keyof TQueryMarkers, TMaybeParser>

const DefaultQueryMarkers: TQueryMarkers = {
    limit: ['$top', '$limit'],
    offset: ['$skip', '$offset'],
    order: ['$orderby', '$order'],
    expand: '$expand',
    select: '$select',
    filter: '$filter',
    count: '$count',
    search: '$search',
}

export type TQueryBuilderDefaults = {
    limit?: number,
    markers?: TQueryMarkers,
}

export class QueryBuilder {
    public static defaults: TQueryBuilderDefaults = {
        markers: DefaultQueryMarkers,
    }
    protected _select: string[] = []
    protected _limit: number = 0
    protected _offset: number = 0
    protected _order: QueryOrder[] = []
    protected _expand: QueryExpand[] = []
    protected _search: string = ''
    protected _count: boolean = false
    protected _filter: QueryFilter[] = []
    protected _noLimitManually: boolean = false
    protected _requestQuery: Map<string, string> = new Map<string, string>()
    protected _parser: TQueryMarkerParsers | undefined

    public static make(): QueryBuilder {
        return new QueryBuilder()
    }

    public constructor() {
        this.setParserForMarkers()
    }

    /**
     *
     * @param marker
     * @param value
     *
     * @private
     */
    public set(marker: string, value: any): this {
        const key = this.getMarkerKey(marker)
        if (!key) throw new Error(`Key field for "${marker}" is missing`)

        const field = `_${key}`
        // @ts-ignore
        this[field] = value
        return this
    }

    private setParserForMarkers() {
        this._parser = {
            limit: QueryIntegerParser.make(),
            offset: QueryIntegerParser.make(),
            order: QueryOrderParser.make(),
            expand: QueryExpandParser.make(),
            select: QuerySelectParser.make(),
            filter: QueryFilterParser.make(),
            count: QueryBooleanParser.make(),
            search: QueryStringParser.make(),
        }
    }

    public hasParserFor(marker: string): boolean {
        const key = this.getMarkerKey(marker)
        if (!key) return false

        // @ts-ignore
        return this._parser[key] ?? false
    }

    public getParserFor(marker: string): IQueryParser | undefined {
        const key = this.getMarkerKey(marker)
        if (!key) return undefined

        // @ts-ignore
        return this._parser[key] ?? undefined
    }

    private getMarkerKey(marker: string): string | undefined {
        let markerKey: string | undefined = undefined
        Object.keys(QueryBuilder.defaults.markers as TQueryMarkers).map((key: string) => {

            let markers: string[]
            // @ts-ignore
            const originMarkers: string[] | string = QueryBuilder.defaults.markers[key]


            if (Array.isArray(originMarkers)) {
                markers = [...originMarkers]
            } else {
                markers = [originMarkers]
            }

            if (markers.includes(marker)) {
                markerKey = key
            }
        })

        return markerKey
    }

    private getMarker(key: keyof TQueryMarkers): string {
        // @ts-ignore
        const values: string | string[] = QueryBuilder.defaults.markers[key]
        return Array.isArray(values) ? values[0] : values
    }

    /** SELECT */

    public select(field: string | string[]): this {
        if (Array.isArray(field)) {
            this._select = this._select.concat(field)
        } else {
            this._select.push(field)
        }
        return this
    }

    public clearSelect(): this {
        this._select = []
        return this
    }

    /** @alias clearSelect */
    public noSelect(): this {
        return this.clearSelect()
    }

    /** /SELECT */

    /** LIMIT */

    public limit(value: number): this {
        this._limit = value
        return this
    }

    public getLimit(): number {
        return this._limit
    }

    /** @alias limit */
    public top(value: number): this {
        return this.limit(value)
    }

    public noLimit(): this {
        this._limit = 0
        this._noLimitManually = true
        return this
    }

    /** @alias noLimit */
    public clearLimit(): this {
        return this.noLimit()
    }
    /** @alias noLimit */
    public clearTop(): this {
        return this.noLimit()
    }

    /** @alias noLimit */
    public noTop(): this {
        return this.noLimit()
    }

    /** /LIMIT */

    /** OFFSET */

    public offset(value: number): this {
        this._offset = value
        return this
    }

    public getOffset(): number {
        return this._offset
    }

    /** @alias offset */
    public skip(value: number): this {
        return this.offset(value)
    }

    /** @alias offset */
    public shift(value: number): this {
        return this.offset(value)
    }

    public noOffset(): this {
        this._offset = 0
        return this
    }

    /** @alias noOffset */
    public clearOffset(): this {
        return this.noOffset()
    }

    /** @alias noOffset */
    public clearSkip(): this {
        return this.noOffset()
    }

    /** @alias noOffset */
    public clearShift(): this {
        return this.noOffset()
    }

    /** @alias noOffset */
    public noSkip(): this {
        return this.noOffset()
    }

    /** @alias noOffset */
    public noShift(): this {
        return this.noOffset()
    }

    /** /OFFSET */

    /** SEARCH */

    public search(value: string): this {
        this._search = value
        return this
    }

    public getSearch(): string {
        return this._search
    }

    public clearSearch():this{
        return this.search('')
    }

    /** @alias clearSearch */
    public noSearch():this{
        return this.clearSearch()
    }

    /** /SEARCH */

    /** COUNT */

    public count(value: boolean = true): this {
        this._count = value
        return this
    }

    /** @alias count */
    public inlineCount(value: boolean = true): this {
        return this.count(value)
    }

    public clearCount(): this {
        return this.count(false)
    }

    /** @alias clearCount */
    public noCount(): this {
        return this.clearCount()
    }

    /** @alias clearCount */
    public noInlineCount(): this {
        return this.clearCount()
    }

    public hasCount(): boolean {
        return this._count
    }

    /** /COUNT */


    /** ORDER */

    public order(order: QueryOrder | string, direction: TQueryOrderDirection | string = 'asc'): this {
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

    /** @alias order */
    public orderby(order: QueryOrder | string, direction: TQueryOrderDirection | string = 'asc'): this {
        return this.order(order, direction)
    }

    public getOrder(): QueryOrder[] {
        return this._order
    }

    public toggleOrder(fieldName: string, addIfNotExists: boolean = true): this {
        const order: QueryOrder | undefined = this._order.find((e: QueryOrder): boolean => e.getField() === fieldName)
        if (order !== undefined) {
            const asc: boolean = order.getDirection() === 'asc'
            order.asc(!asc)

        } else {
            if (addIfNotExists) {
                this.order(fieldName)
            }
        }
        return this
    }

    public removeOrder(field: string | null = null): this {
        if (field === null) {
            this._order = []
        } else {
            const index: number = this._order.findIndex((e: QueryOrder): boolean => e.getField() === field)
            if (index >= 0) {
                this._order.splice(index, 1)
            }
        }
        return this
    }

    public clearOrder(): this {
        this._order = []
        return this
    }

    /** @alias clearOrder */
    public noOrder(): this {
        return this.clearOrder()
    }

    public hasOrderField(field: string): boolean {
        if (this.getOrder().length === 0) return false
        const found = this.getOrder()
            .find((e: QueryOrder): boolean => e.getField() === field)

        return found !== undefined
    }

    public getOrderByField(field: string): QueryOrder | undefined {
        if (this.getOrder().length === 0) return undefined
        return this.getOrder()
            .find((e: QueryOrder): boolean => e.getField() === field)
    }

    /** /ORDER */

    /** EXPAND */

    public expand(entity: string | string[] | QueryExpand | QueryExpand[], count: boolean = false): this {
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

    public getExpand(): QueryExpand[] {
        return this._expand
    }

    public clearExpand(): this {
        this._expand = []
        return this
    }

    /** @alias clearExpand */
    public noExpand(): this {
        return this.clearExpand()
    }

    /** /EXPAND */

    /** FILTER */

    public filter(field: QueryFilter | string, value: any = '', option: TQueryFilterSign | string = 'eq', concat: TQueryFilterConcatenate | string = 'and'): this {
        const newFilter: QueryFilter = (field instanceof QueryFilter)
            ? field
            : QueryFilter.make(field, value, option)

        newFilter.concat(concat.toLowerCase() as TQueryFilterConcatenate)
        this._filter?.push(newFilter)

        return this
    }

    public filterAnd(field: QueryFilter | string, value: any = '', option: TQueryFilterSign | string = 'eq'): this {
        return this.filter(field, value, option, 'and')
    }

    public filterOr(field: QueryFilter | string, value: any = '', option: TQueryFilterSign | string = 'eq'): this {
        return this.filter(field, value, option, 'or')
    }

    public filterSet(field: QueryFilter | string, value: any = '', option: TQueryFilterSign | string = 'eq'): this {
        const newFilter: QueryFilter = (field instanceof QueryFilter)
            ? field
            : QueryFilter.make(field, value, option)

        if (this.filterExist(newFilter.getField())) {
            const index = this._filter.findIndex((filter: QueryFilter): boolean => filter.getField().toLowerCase() === newFilter.getField().toLowerCase())
            this._filter[index] = newFilter
        } else {
            this._filter.push(newFilter)
        }

        return this
    }

    protected filterExist(field: string): boolean {
        const index = this._filter.findIndex((filter: QueryFilter): boolean => filter.getField().toLowerCase() === field.toLowerCase())
        return index >= 0
    }

    public getFilterByField(field: string): QueryFilter | null {
        const index = this._filter.findIndex((filter: QueryFilter): boolean => filter.getField().toLowerCase() === field.toLowerCase())
        if (index < 0) return null
        return this._filter[index]
    }

    public filterDelete(field: string): this {
        const idx = this._filter.findIndex((e: QueryFilter): boolean => e.getField().toLowerCase() === field.toLowerCase())
        if (idx >= 0) {
            this._filter.splice(idx, 1)
        }
        return this
    }

    public getFilter(): QueryFilter[] {
        return this._filter
    }

    public clearFilter(): this {
        this._filter = []
        return this
    }

    /** @alias clearFilter */
    public noFilter(): this {
        return this.clearFilter()
    }

    /** /FILTER */

    /** CUSTOM QUERY */
    public querySet(key: string, value: string): this {
        this._requestQuery.set(key, value)
        return this
    }

    public queryDelete(key: string): this {
        if (this._requestQuery.has(key)) {
            this._requestQuery.delete(key)
        }
        return this
    }

    public queryGet(key: string): string | null {
        // @ts-ignore
        return this._requestQuery.has(key) ? this._requestQuery.get(key).toString() : null
    }

    /** /CUSTOM QUERY */

    private prepareQuery(): QuerySearchParams {
        const query = new QuerySearchParams()

        if (this._limit > 0) {
            query.set(this.getMarker('limit'), this._limit.toString())
            // console.log('query', query)
        } else if (QueryBuilder.defaults.limit
            && QueryBuilder.defaults.limit > 0
            && !this._noLimitManually) {
            query.set(this.getMarker('limit'), QueryBuilder.defaults.limit.toString())
        }
        if (this._offset > 0) {
            query.set(this.getMarker('offset'), this._offset.toString())
        }
        if (this._count) {
            query.set(this.getMarker('count'), 'true')
        }
        if (this._order.length > 0) {
            const aOrder: string[] = []
            this._order.map((oOrder: QueryOrder): void => {
                aOrder.push(oOrder.toString())
            })
            query.set(this.getMarker('order'), aOrder.join(','))
        }

        if (Array.isArray(this._filter) && this._filter.length > 0) {
            const filter: QueryFilter = QueryFilter.make('')
            this._filter.map((f: QueryFilter): void => {
                filter.addChild(f)
            })
            query.set(this.getMarker('filter'), filter.toString())
        }

        if (this._expand.length > 0) {
            const expands: string[] = []
            this._expand.map((exp: QueryExpand): void => {
                expands.push(exp.toString())
            })
            query.set(this.getMarker('expand'), expands.join(','))
        }

        if (this._select.length > 0) {
            query.set(this.getMarker('select'), this._select.join(','))
        }

        if (!!this._search) {
            query.set(this.getMarker('search'), this._search)
        }

        if (this._requestQuery.size > 0) {
            this._requestQuery.forEach((value: string, key: string): void => {
                query.set(key, value)
            })
        }

        return query
    }

    public toString(encode: boolean = true): string {
        const query = this.prepareQuery()
        return query.toString(encode)
    }

    public toJson(): object {
        const query: QuerySearchParams = this.prepareQuery()
        return query.toJson()
    }

    public static parse(url: string): QueryBuilder {
        const r = new RegExp('^(?:[a-z+]+:)?//', 'i')
        const isUrlAbsolute: boolean = r.test(url)
        const urlParts: string[] = url.split(/\?(.*)/s)

        // ToDo fix when used trailing ID
        let entityPath: string = urlParts[0]
        if (!isUrlAbsolute) {
            const regex: RegExp = new RegExp("(?:(?<protocol>[^\\:]*)\\:\\\/\\\/)?(?:(?<user>[^\\:\\@]*)(?:\\:(?<password>[^\\@]*))?\\@)?(?:([^\\\/\\:]*)\\.(?=[^\\.\\\/\\:]*\\.[^\\.\\\/\\:]*))?(?<host>[^\\.\\\/\\:]*)(?:\\.(?<domain>[^\\\/\\.\\:]*))?(?:\\:(?<port>[0-9]*))?(?<path>\\\/[^\\?#]*(?=.*?\\\/)\\\/)?(?<script>[^\\?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<hash>.*))?", '')
            const res: RegExpExecArray | null = regex.exec(url)
            if (res && res.groups && res.groups.script) {
                entityPath = `${res.groups.script}`
                entityPath = (entityPath.startsWith('/') ? '' : '/') + entityPath
            }
        }

        const qb: QueryBuilder = QueryBuilder.make()
        if (urlParts.length > 1) {
            const query: Record<string, string> = Object.fromEntries(new URLSearchParams(urlParts[1]))

            let allMarkers: string[] = []
            Object.keys(QueryBuilder.defaults.markers as TQueryMarkers).map((key: string) => {

                let markers: string[]
                // @ts-ignore
                const originMarkers: string[] | string = QueryBuilder.defaults.markers[key]


                if (Array.isArray(originMarkers)) {
                    markers = [...originMarkers]
                } else {
                    markers = [originMarkers]
                }

                allMarkers = allMarkers.concat(markers)
                markers.map((marker: string) => {
                    if (Object.keys(query).includes(marker) && qb.hasParserFor(marker)) {
                        const parser: IQueryParser = qb.getParserFor(marker) as IQueryParser
                        qb.set(marker, parser.parse(query[marker]))
                    }
                })
            })

            Object.keys(query).map((param: string): void => {
                if (!allMarkers.includes(param)) {
                    qb.querySet(param, query[param])
                }
            })
        }
        return qb
    }
}
