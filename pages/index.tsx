import type { NextPage, GetStaticPropsContext } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { getProducts } from '../graphql/queries'

export async function getStaticProps(Context: GetStaticPropsContext) {
  const variables = {}
  const response = await fetch(`${process.env.SHOPIFY_STOREFRONT_URL}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': `${process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query: getProducts, variables })
  })
  const json = await response.json()

  const data = json.data.products.edges.map((item: { node: any }) => {
    return item.node
  })

  return (
    {
      props: { products: data }
    }
  )
}

const Home: NextPage = (props: any) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          BeerHouse
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
         {props.products.map((product: any) => {
           return (
            <div key={product.id}>
              <Link href={`/product/${product.handle}`}>
                <a>
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                </a>
              </Link>
            </div>
           )
         })

         }
        </div>
      </main>
    </div>
  )
}

export default Home