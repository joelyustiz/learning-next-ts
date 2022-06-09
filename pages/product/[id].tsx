import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import type {
  GetStaticPathsContext,
  GetStaticPropsContext
} from 'next'
import { getProduct, getListProducts } from '../../graphql/queries'

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const variables = {}
  const response = await fetch(`${process.env.SHOPIFY_STOREFRONT_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': `${process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query: getListProducts, variables })
  })

  const json = await response.json()
  const paths = json.data.products.edges.map((product: any) => {
    console.log('product.node.handle', product)

    return { params: { id: `${product.node.handle}` }}
  })

  return {
    paths,
    fallback: 'blocking'
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
      query: getProduct,
      variables: { id:  params?.id}
    })
  })
  const json = await response.json()
  console.log('-------json.data------', json)

  return {
    props: {
      product: json.data.productByHandle
    },
    revalidate: 10
  }
}

export default function Collections(props: any) {
  console.log('props', props)
  return (
    <main>
      <Head>
        <title>Colecciones</title>
      </Head>

      <Link href="/">
        <a>Go back to home</a>
      </Link>
      <div>
        {props.product?.images?.edges?.length > 0 &&
          <Image
            src={props.product.images.edges[0].node.src}
            alt="Picture of the author"
            width={500}
            height={500}
          />
        }
        <h3>{props.product.title}</h3>
        <p>{props.product.description}</p>
      </div>
    </main>
  )
}