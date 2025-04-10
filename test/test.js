const {strictEqual} = require("assert")

const {QueryBuilder} = require("../dist");

const nLimit = 4
const nOffset = 3
const sSearch = 'John Quick'
const sUrl = 'http://mockdata.test/odata'
const sRelativePath = '/employees'
const sAllQuery = `$top=${nLimit}&$skip=${nOffset}&$filter=name1 eq 'qq?' and startsWith(name2, 'ee') eq true&$count=true&$order=name asc,age desc&$expand=rel,addr&$select=id,name,age&$search=${sSearch}`
const sAbsoluteUrl = `${sUrl}/?${sAllQuery}`
const sRelativeUrl = `${sRelativePath}?${sAllQuery}`

describe('Query builder', function () {
    it(`Create instance`, function () {
        const o = QueryBuilder.make()
        strictEqual(o.getLimit(), 0)
    })

    describe('Building', function () {
        it(`Top`, function () {
            const o = QueryBuilder.make()
                .limit(nLimit)
            strictEqual(o.toString(false), `$top=${nLimit}`)
        })
        it(`Offset`, function () {
            const o = QueryBuilder.make()
                .offset(nOffset)
            strictEqual(o.toString(false), `$skip=${nOffset}`)
        })
        it(`Search`, function () {
            const o = QueryBuilder.make()
                .search(sSearch)
            strictEqual(o.toString(false), `$search=${sSearch}`)
        })
        it(`Count`, function () {
            const o = QueryBuilder.make()
                .count()
            strictEqual(o.toString(false), `$count=true`)
        })
        it(`Order`, function () {
            const o = QueryBuilder.make()
                .order('name', 'asc')
                .order('age', 'desc')
            strictEqual(o.toString(false), `$orderby=name asc,age desc`)
        })
        it(`Expand`, function () {
            const o = QueryBuilder.make()
                .expand('rel')
                .expand('addr')
            strictEqual(o.toString(false), `$expand=rel,addr`)
        })
        it(`Select`, function () {
            const o = QueryBuilder.make()
                .select('id')
                .select('name')
                .select('age')
            strictEqual(o.toString(false), `$select=id,name,age`)
        })
        it(`Filter`, function () {
            // $filter=name1 eq 'qq?' and startsWith(name2, 'ee') eq true
            const o = QueryBuilder.make()
                .filter('name1', 'qq?')
                .filter('name2', 'ee', 'startswith')
            strictEqual(o.toString(false), `$filter=name1 eq 'qq?' and startswith(name2, 'ee') eq true`)
        })
    })

    describe('Parsing', function () {
        it(`Parse absolute URL`, function () {
            const o = QueryBuilder.parse(sAbsoluteUrl)
            strictEqual(o.getLimit(), nLimit)
            strictEqual(o.getOffset(), nOffset)
            strictEqual(o.getSearch(), sSearch)
        })
        it(`Parse relative URL`, function () {
            const o = QueryBuilder.parse(sRelativeUrl)
            strictEqual(o.getLimit(), nLimit)
            strictEqual(o.getOffset(), nOffset)
            strictEqual(o.getSearch(), sSearch)
        })
    })
})


//
//
// describe('oData query builder', function () {
//     it('Create builder instance', function () {
//         const o = QueryBuilder.make(sUrl)
//         strictEqual(o.getUrl(), sUrl)
//     });
//     it('Simple URL `http://crm/odata/employe`', function () {
//         const o = new QueryBuilder(sUrl)
//         strictEqual(o.toString(false), sUrl)
//     });
//     it(`Simple URL '${sUrl}' with query 'lang=en&search=sun'`, function () {
//         const o = new QueryBuilder(sUrl)
//         o.querySet('lang', 'en').querySet('search', 'sun')
//         strictEqual(o.toString(false), sUrl + '?lang=en&search=sun')
//     });
//
//     describe('Ordering', function () {
//         it('Order `name1 asc`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order(new QueryOrder('name1'))
//             strictEqual(o.toString(false), `${sUrl}?$orderby=name1 asc`)
//         });
//         it('Order `name2 desc`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order(new QueryOrder('name2', QueryOrderDirection.DESC))
//             strictEqual(o.toString(false), `${sUrl}?$orderby=name2 desc`)
//         });
//         it('Order `name1 asc` and `name2 desc`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order(new QueryOrder('name1')).order(new QueryOrder('name2', QueryOrderDirection.DESC))
//             strictEqual(o.toString(false), `${sUrl}?$orderby=name1 asc,name2 desc`)
//         });
//         it('Adding several orderings for one field', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order(new QueryOrder('name1'))
//                 .order(new QueryOrder('name1', QueryOrderDirection.DESC))
//             strictEqual(o.toString(false), `${sUrl}?$orderby=name1 desc`)
//         });
//         it('Adding order via field and value', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order('name1')
//                 .order('name2', QueryOrderDirection.DESC)
//                 .order('name3', 'Asc')
//             strictEqual(o.toString(false), `${sUrl}?$orderby=name1 asc,name2 desc,name3 asc`)
//         });
//         it('Remove order', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order('name1')
//                 .order('name2', QueryOrderDirection.DESC)
//                 .order('name3', 'Asc')
//                 .removeOrder('name2')
//             strictEqual(o.toString(false), `${sUrl}?$orderby=name1 asc,name3 asc`)
//         });
//         it('Remove order', function () {
//             const o = new QueryBuilder(sUrl)
//             o.order('name1')
//                 .order('name2', QueryOrderDirection.DESC)
//                 .order('name3', 'Asc')
//                 .removeOrder()
//             strictEqual(o.toString(false), `${sUrl}`)
//         });
//     });
//
//     describe('Expanding', function () {
//         it('Expand `company`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.expand('company')
//             strictEqual(o.toString(false), `${sUrl}?$expand=company`)
//         });
//         it('Expand `company` and `jobtitle`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.expand('company').expand('jobtitle')
//             strictEqual(o.toString(false), `${sUrl}?$expand=company,jobtitle`)
//         });
//         it('Expand with count', function () {
//             const o = new QueryBuilder(sUrl)
//             o.expand('emails', true)
//             strictEqual(o.toString(false), `${sUrl}?$expand=emails($count=true)`)
//         });
//     });
//
//     describe('Limiting', function () {
//         it('Top 7', function () {
//             const o = new QueryBuilder(sUrl)
//             o.top(7)
//             strictEqual(o.toString(false), `${sUrl}?$top=7`)
//         });
//         it('Shift 4', function () {
//             const o = new QueryBuilder(sUrl)
//             o.offset(4)
//             strictEqual(o.toString(false), `${sUrl}?$skip=4`)
//         });
//         it('Top 7 and Shift 4', function () {
//             const o = new QueryBuilder(sUrl)
//             o.limit(7).shift(4)
//             strictEqual(o.toString(false), `${sUrl}?$top=7&$skip=4`)
//         });
//     });
//
//     describe('Filtering', function () {
//         it('gender eq `f`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.filter(new QueryFilter('gender', 'f'))
//             strictEqual(o.toString(false), `${sUrl}?$filter=gender eq 'f'`)
//         });
//         it('age gt 16', function () {
//             const o = new QueryBuilder(sUrl)
//             o.filter(new QueryFilter('age', 16, QueryFilterSign.GT))
//             strictEqual(o.toString(false), `${sUrl}?$filter=age gt '16'`)
//         });
//         it('gender eq `f` and age gt 16', function () {
//             const o = new QueryBuilder(sUrl)
//             const oFilter = new QueryFilter('gender', 'f')
//             oFilter.and('age', 16, QueryFilterSign.GT)
//             o.filter(oFilter)
//             strictEqual(o.toString(false), `${sUrl}?$filter=gender eq 'f' and age gt '16'`)
//         });
//         it("substringof(name, 'ohn') eq true", function () {
//             const o = new QueryBuilder(sUrl)
//             const oFilter = new QueryFilter('name', 'ohn', QueryFilterSign.SUBSTRINGOF)
//             o.filter(oFilter)
//             strictEqual(o.toString(false), `${sUrl}?$filter=substringof(name, 'ohn') eq true`)
//         });
//         it("startswith(name, 'ohn') eq true", function () {
//             const o = new QueryBuilder(sUrl)
//             const oFilter = new QueryFilter('name', 'ohn', QueryFilterSign.STARTSWITH)
//             o.filter(oFilter)
//             strictEqual(o.toString(false), `${sUrl}?$filter=startswith(name, 'ohn') eq true`)
//         });
//         it("endswith(name, 'ohn') eq true", function () {
//             const o = new QueryBuilder(sUrl)
//             const oFilter = new QueryFilter('name', 'ohn', QueryFilterSign.ENDSWITH)
//             o.filter(oFilter)
//             strictEqual(o.toString(false), `${sUrl}?$filter=endswith(name, 'ohn') eq true`)
//         });
//         it('Replacing filter value, using filterSet', function () {
//             const o = new QueryBuilder(sUrl)
//             o.filter(new QueryFilter('gender', 'f'))
//             o.filterSet('gender', 'm')
//             strictEqual(o.toString(false), `${sUrl}?$filter=gender eq 'm'`)
//         });
//
//         describe('Complex filter', function () {
//             it('AND condition: gender eq `f` and age gt `16`', function () {
//                 const o = new QueryBuilder(sUrl)
//                 const oFilter = new QueryFilter('gender', 'f')
//                 const oFilterAge = new QueryFilter('age', 16, QueryFilterSign.GT)
//                 oFilter.and(oFilterAge)
//                 o.filter(oFilter)
//                 strictEqual(o.toString(false), `${sUrl}?$filter=gender eq 'f' and age gt '16'`)
//             });
//             it('OR condition: gender eq `f` or age gt 16', function () {
//                 const o = new QueryBuilder(sUrl)
//                 const oFilter = new QueryFilter('gender', 'f')
//                 const oFilterAge = new QueryFilter('age', 16, QueryFilterSign.GT)
//                 oFilter.or(oFilterAge)
//                 o.filter(oFilter)
//                 strictEqual(o.toString(false), `${sUrl}?$filter=gender eq 'f' or age gt '16'`)
//             });
//             it('OR & String function condition: name1 or name2 starts with `ohn`', function () {
//                 const o = new QueryBuilder(sUrl)
//                 const oFilter = new QueryFilter('name1', 'ohn', QueryFilterSign.STARTSWITH)
//                 const oFilterName2 = new QueryFilter('name2', 'ohn', QueryFilterSign.STARTSWITH)
//                 oFilter.or(oFilterName2)
//                 o.filter(oFilter)
//                 strictEqual(o.toString(false), `${sUrl}?$filter=startswith(name1, 'ohn') eq true or startswith(name2, 'ohn') eq true`)
//             });
//             it('filterOr function', function () {
//                 const o = new QueryBuilder(sUrl)
//                 const oFilter = new QueryFilter('name1', 'ohn', QueryFilterSign.STARTSWITH)
//                 const oFilterName2 = new QueryFilter('name2', 'ohn', QueryFilterSign.STARTSWITH)
//                 // oFilter.or(oFilterName2)
//                 o.filter(oFilter).filterOr(oFilterName2)
//                 strictEqual(o.toString(false), `${sUrl}?$filter=startswith(name1, 'ohn') eq true or startswith(name2, 'ohn') eq true`)
//             });
//         });
//     });
//
//     describe('Counting', function () {
//         it('Simple count', function () {
//             const o = new QueryBuilder(sUrl)
//             o.count()
//             strictEqual(o.toString(false), `${sUrl}/$count`)
//         });
//         it('Count with filter, where age gt `16`', function () {
//             const o = new QueryBuilder(sUrl)
//             o.filter(new QueryFilter('age', 16, QueryFilterSign.GT)).count()
//             strictEqual(o.toString(false), `${sUrl}/$count?$filter=age gt '16'`)
//         });
//         it('Inline count', function () {
//             const o = new QueryBuilder(sUrl)
//             o.inlineCount()
//             strictEqual(o.toString(false), `${sUrl}?$count=true`)
//         });
//     });
//
//     describe('Parsing input http request', function () {
//         it('Parse simple url', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}`), true)
//             strictEqual(o.toString(false), `${sUrl}`)
//         });
//         it('Parse url path', function () {
//             const o = QueryBuilder.parse(encodeURI(`/employee`))
//             strictEqual(o.toString(false), `/employee`)
//         });
//         it('Parse input OData url', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$top=7&$limit=4&$filter=name1 eq 'qq?' and startsWith(name2, 'ee') eq true`), true)
//             o.limit(7).shift(4)
//             strictEqual(o.toString(false), `${sUrl}?$top=7&$skip=4&$filter=name1 eq 'qq?' and startswith(name2, 'ee') eq true`)
//         });
//         it('Parse input OData url with custom params', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$top=7&$skip=4&page=1&$filter=name1 eq 'qq'`), true)
//             o.limit(7).shift(4)
//             strictEqual(o.toString(false), `${sUrl}?$top=7&$skip=4&$filter=name1 eq 'qq'&page=1`)
//         });
//         it('Parse input OData url and get filter value', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$top=7&$skip=4&page=1&$filter=name1 eq 'qq'`), true)
//             o.limit(7).shift(4)
//             strictEqual(o.getFilterByField('name1').getValue(), `qq`)
//         });
//         it('Parse input OData url with inline count', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$count=true`), true)
//             strictEqual(o.toString(false), `${sUrl}?$count=true`)
//         });
//         it('Parse input OData url with expand count', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$expand=emails($count=true)`), true)
//             strictEqual(o.toString(false), `${sUrl}?$expand=emails($count=true)`)
//         });
//         it('Parse input OData url, getting part only', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$top=7&$limit=4&$filter=name1 eq 'qq?' and startsWith(name2, 'ee') eq true`))
//             o.limit(7).shift(4)
//             strictEqual(o.toString(false), `/employe?$top=7&$skip=4&$filter=name1 eq 'qq?' and startswith(name2, 'ee') eq true`)
//         });
//         it('Parse input OData url with $count parameter', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$count=true`))
//             strictEqual(o.toString(false), `/employe?$count=true`)
//         });
//         it('Parse input OData url with $search parameter', function () {
//             const o = QueryBuilder.parse(encodeURI(`${sUrl}?$search=string value`))
//             strictEqual(o.toString(false), `/employe?$search=string value`)
//         });
//     })
//
//     describe('Submit HTTP request', function () {
//         const extUrl = 'https://dummyjson.com/products'
//         it('External request', function (done) {
//             QueryBuilder.make(extUrl)
//                 .onSuccess(response => {
//                     strictEqual(response.status, 200)
//                     done()
//                 })
//                 .get()
//         });
//     });
//
//     describe('Misc', function () {
//         it('By ID', function () {
//             const o = new QueryBuilder(sUrl)
//             o.id(4)
//             strictEqual(o.toString(false), `${sUrl}(4)`)
//         });
//         it('Use trailing ID', function () {
//             const o = new QueryBuilder(sUrl)
//             o.id(4).trailingId()
//             strictEqual(o.toString(false), `${sUrl}/4`)
//         });
//         it('$select', function () {
//             const o = new QueryBuilder(sUrl)
//             o.select(['id', 'name'])
//             strictEqual(o.toString(false), `${sUrl}?$select=id,name`)
//         });
//         it('$search', function () {
//             const o = new QueryBuilder(sUrl)
//             o.search('Some string')
//             strictEqual(o.toString(false), `${sUrl}?$search=Some string`)
//         });
//     });
// });
