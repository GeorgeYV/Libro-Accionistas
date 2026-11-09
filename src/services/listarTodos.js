import { API } from 'aws-amplify';

// Recorre todas las páginas de una query list* de AppSync (sin el tope de `limit: 1000`).
// campo: nombre del campo de la respuesta, p. ej. 'listTitulos'.
export async function listarTodos(query, campo, variables = {}) {
  const items = [];
  let nextToken = null;
  do {
    const apiData = await API.graphql({ query, variables: { ...variables, limit: 1000, nextToken } });
    items.push(...apiData.data[campo].items);
    nextToken = apiData.data[campo].nextToken;
  } while (nextToken);
  return items;
}
