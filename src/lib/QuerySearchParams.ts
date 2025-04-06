export class QuerySearchParams {
    private queryParams = new Map<string, string>()

    public set(name: string, value: string): void {
        this.queryParams.set(name, value)
    }

    public has(name: string, value?: string | undefined): boolean {
        let res: boolean = this.queryParams.has(name)
        if (!res) return false

        return !value ? res : this.get(name) === value
    }

    public get(name: string): string | undefined {
        return this.queryParams.get(name)
    }

    public toString(encode: boolean = true): string {
        const vals: string[] = []
        this.queryParams.forEach((value:string, key:string) => vals.push(`${key}=${value}`))
        return encode ? encodeURI(vals.join('&')) : vals.join('&')
    }

    public toJson(): object {
        const res: any = {}
        this.queryParams.forEach((value: string, key: string) => res[key] = value)
        return res as object
    }
}
