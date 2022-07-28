import client from '@sanity/client'

const api = client({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  token: process.env.REACT_APP_SANITY_TOKEN,
})

export default api
