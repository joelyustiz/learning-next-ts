import { useMemo } from 'react'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
  ApolloLink
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { concatPagination } from '@apollo/client/utilities'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import * as prismic from '@prismicio/client'

// Fill in your repository name
export const repositoryName = 'mx-beerhouse'
export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'
let apolloClient

const prismicClient = prismic.createClient(
  prismic.getEndpoint(repositoryName),
  {
    // If your repository is private, add an access token
    accessToken: '',

    // This defines how you will structure URL paths in your project.
    // Update the types to match the Custom Types in your project, and edit
    // the paths to match the routing in your project.
    //
    // If you are not using a router in your project, you can change this
    // to an empty array or remove the option entirely.
    routes: [
      {
        type: 'page',
        path: '/',
      },
    ],
  }
)

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  if (networkError) console.log(`[Network error]: ${networkError}`)
})

const bhShopifyStoreFrontLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL}`,
  credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
})

const prismicLink = new HttpLink({
  uri: prismic.getGraphQLEndpoint(repositoryName),
  fetch: prismicClient.graphQLFetch,
  useGETForQueries: true
})

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'X-Shopify-Storefront-Access-Token': `${process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN}`
    }
  }));

  return forward(operation);
})

const otherLinks = ApolloLink.split(
  operation => operation.getContext().clientName === 'prismic',
  prismicLink
)

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([
      errorLink,
      ApolloLink.split(
        operation => operation.getContext().clientName === 'shopify-store-front',
        authMiddleware.concat(bhShopifyStoreFrontLink),
        otherLinks
      )
    ]),
    cache: new InMemoryCache({
      typePolicies: {},
    }),
  })
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
    const data = merge(existingCache, initialState, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(pageProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initializeApollo(state), [state])
  return store
}
