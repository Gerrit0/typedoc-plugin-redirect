# typedoc-plugin-redirect

Add redirect pages to your generated documentation.

## Usage

```bash
npm install --save-dev typedoc-plugin-redirect
```

```js
// typedoc.config.mjs

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    plugin: ["typedoc-plugin-redirect"],
    redirects: {
        // If the value starts with http[s]://, it will redirect to an external site.
        "example.html": "https://example.com",
        // If the value starts with a slash, the link will be included verbatim.
        "contact.html": "/cgi-bin/contact.php",
        // Otherwise, the link will be interpreted relative to the output directory.
        "DocsClass.html": "api/classes/DocsClass.html",
        // If the key ends with a trailing slash, "/index.html" will be appended to form
        // the output file name. The following two entries are equivalent.
        "options/": "documents/Options.html",
        "options/index.html": "documents/Options.html",
    },
};
```

## Example

See [an example](https://gerritbirkeland.com/typedoc-plugin-redirect/) of this plugin in action.

-   <https://gerritbirkeland.com/typedoc-plugin-redirect/example/> redirects to <https://example.com>
-   <https://gerritbirkeland.com/typedoc-plugin-redirect/load.html> redirects to <https://gerritbirkeland.com/typedoc-plugin-redirect/functions/load.html>
