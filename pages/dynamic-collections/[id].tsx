import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import type {
  GetServerSideProps
} from 'next'
import { getCollectionWithProducts, getCollectionsList } from '../../graphql/queries'
//dynamic-collections
export const getServerSideProps: GetServerSideProps = async (context) => {
  const response = await fetch(`${process.env.SHOPIFY_STOREFRONT_URL}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': `${process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      query: getCollectionWithProducts,
      variables: { id:  context.params?.id}
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
  console.log('props', props);
  
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
              <Link href={`/product/${product.handle}`}>
                <a>
                  {product.images.edges.length > 0 &&
                    <>
                      <Image
                        src={product.images.edges[0].node.src}
                        alt="Picture of the author"
                        width={500}
                        height={500}
                      />
                      <p>{product?.title || 'Sin título'}</p>
                    </>
                  }
                </a>
              </Link>
            </div>
          )
        })

        }
      </div>
    </main>
  )
}
