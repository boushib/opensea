import client from '@sanity/client'

const api = client({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
  token: process.env.REACT_APP_SANITY_TOKEN,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2021-08-31',
  ignoreBrowserTokenWarning: true,
})

export default api
