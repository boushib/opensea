import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'

export default createSchema({
  name: 'default',
  // Concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    {
      name: 'user',
      title: 'User',
      type: 'document',
      fields: [
        {
          name: 'username',
          title: 'Username',
          type: 'string',
        },
        {
          name: 'address',
          title: 'Wallet Address',
          type: 'string',
        },
        {
          name: 'avatar',
          title: 'Avatar',
          type: 'image',
        },
        {
          name: 'banner',
          title: 'Banner',
          type: 'image',
        },
        {
          name: 'twitter',
          title: 'Twitter Username',
          type: 'string',
        },
        {
          name: 'instagram',
          title: 'Instagram Username',
          type: 'string',
        },
      ],
    },
    {
      name: 'collection',
      title: 'Collection',
      type: 'document',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string',
        },
        {
          name: 'contract',
          title: 'Contract',
          type: 'string',
        },
        {
          name: 'description',
          title: 'Description',
          type: 'string',
        },
        {
          name: 'creator',
          title: 'Creator',
          type: 'reference',
          to: [{ type: 'user' }],
        },
        {
          name: 'volumeTraded',
          title: 'Volume Traded',
          type: 'number',
        },
        {
          name: 'floorPrice',
          title: 'Floor Price',
          type: 'number',
        },
        {
          name: 'owners',
          title: 'Owners',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'user' }] }],
        },
        {
          name: 'avatar',
          title: 'Avatar',
          type: 'image',
        },
        {
          name: 'banner',
          title: 'Banner',
          type: 'image',
        },
      ],
    },
  ]),
})
