export const buildResponseMessages = (entity: string) => ({
  createFailed: `${entity} create failed`,
  created: `${entity} created`,
  deleteFailed: `${entity} delete failed`,
  deleted: `${entity} deleted`,
  notFound: `${entity} not found`,
  updateFailed: `${entity} update failed`,
  updated: `${entity} updated`,
  serverError: 'Internal server error',
})
