export const productSchema = `
  {
    descriptionHtml
    description
    productType
    handle
    createdAt
    id
    tags
    title
    images (first: 50) {
      edges {
        node {
          src
        }
      }
    }
    seo {
      title
      description
    }
    variants(first: 50) {
      edges {
        variant: node {
          availableForSale
          compareAtPriceV2 {
            amount
          }
          id
          limitPerOrder: metafield(namespace:"my_fields", key: "limit_per_order") {
            value
          }
          isSubscription: metafield(namespace:"my_fields", key: "subscription") {
            value
          }
          priceV2 {
            amount
          }
          sku
          title
          weight
        }
      }
    }
    vendor
  }
`

export const collectionSchema = `
  handle
  id
  description
  products(first: 250, after: $after, sortKey: $sortKey) {
    edges {
      cursor
      product: node ${productSchema}
    }
    pageInfo {
      hasNextPage
    }

  }
  title
`

export const getProducts = `
  query getProducts {
    products (first: 5) {
      edges {
        node ${productSchema}
      }
    }
  }
`

export const getProductsLast = `
  query getProducts {
    products (first: 15, sortKey: TITLE) {
      edges {
        node ${productSchema}
      }
    }
  }
`

export const getCollectionsList = `
  query getCollections {
    collections(first: 20) {
      edges {
        node {
          handle
        }
      }
    }
  }
`

export const getCollectionWithProducts = `
  query MyQuery ($id: String!){
    collectionByHandle(handle: $id) {
      id
      image {
        src
      }
      handle
      description
      title
      products (first: 5) {
        edges {
          node {
            id
            description
            handle
            title
            images (first: 10){
              edges {
                node {
                  src
                }
              }
            }
          }
        }
      }
    }
  }
`

export const getListProducts = `
  query getListProducts {
    products(first: 2) {
      edges {
        node {
          handle
        }
      }
    }
  }
`

export const getProduct = `
  query getProduct($id: String!) {
    productByHandle (handle: $id) ${productSchema}
  }
`
