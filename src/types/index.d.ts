export declare interface IQueryParser {
    parse(value: string): void
}

export declare type TQueryMarkers = {
    select: string[] | string,
    limit: string[] | string,
    offset: string[] | string,
    order: string[] | string,
    expand: string[] | string,
    search: string[] | string,
    count: string[] | string,
    filter: string[] | string,
}

export declare type TQueryFilterSign =
    'eq'
    | 'gt'
    | 'ge'
    | 'lt'
    | 'le'
    | 'ne'
    | 'substringof'
    | 'startswith'
    | 'endswith'
    | 'contains'

export declare type TQueryFilterConcatenate = 'and' | 'or'

export type TQueryOrderDirection = 'asc' | 'desc'
