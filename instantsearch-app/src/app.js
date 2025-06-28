const { algoliasearch, instantsearch } = window;

const searchClient = algoliasearch('2TEX2BFMHP', 'f70b633e11d11d62b5d7aa33c4143ae0');

const search = instantsearch({
  indexName: 'VSuper Gaming App',
  searchClient,
  future: { preserveSharedStateOnUnmount: true },
  
});


search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
<article>
  <div>
    <h1>${components.Highlight({hit, attribute: "name"})}</h1>
    <p>${components.Highlight({hit, attribute: "description"})}</p>
    <p>${components.Highlight({hit, attribute: "files"})}</p>
  </div>
</article>
`,
    },
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 8,
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();

