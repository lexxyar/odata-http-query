import type {IQueryParser} from "../../types";

export class QueryParser<T> implements IQueryParser {
    public static make(): IQueryParser {
        return new this
    }

    public parse(value: string):T{
        return value as T
    }
}
