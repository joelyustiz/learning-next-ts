import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import type {
  GetStaticPathsContext,
  GetStaticPropsContext
} from 'next'
import { getCollectionWithProducts, getCollectionsList } from '../../graphql/queries'

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const variables = {}
  const response = await fetch(`${process.env.SHOPIFY_STOREFRONT_URL}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': `${process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query: getCollectionsList, variables })
  })

  const json = await response.json()
  const paths = json.data.collections.edges.map((product: any) => {
    return { params: { id: `${product.node.handle}` }}
  })

  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }: GetStaticPropsContext<{ id: any }>) {
  const response = await fetch(`${process.env.SHOPIFY_STOREFRONT_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': `${process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      query: getCollectionWithProducts,
      variables: { id:  params?.id}
    })
  })
  const json = await response.json()
  const data = json.data.collectionByHandle.products.edges.length > 0
     ? json.data.collectionByHandle.products.edges.map((item: { node: any }) => {
      return item.node
    })
    : []

  return {
    props: {
      title: json.data.collectionByHandle?.title,
      products: data
    },
  }
}

export default function Collections(props: any) {
  return (
    <main>
      <Head>
        <title>Colecciones</title>
      </Head>

      <Link href="/">
        <a>Go back to home</a>
      </Link>
      <div>
        Titulo: {props.title}
      </div>
      <div>
        {props.products.length > 0 && props.products.map((product: any) => {
          return (
            <div key={product.id}>
              {product.images.edges.length > 0 &&
                <Image
                  src={product.images.edges[0].node.src}
                  alt="Picture of the author"
                  width={500}
                  height={500}
                />
              }
            </div>
          )
        })

        }
      </div>
    </main>
  )
}
