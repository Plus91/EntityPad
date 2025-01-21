# EntityPad

`EntityPad` is a jQuery plugin that creates a dynamic, searchable input field for entity selection with color-coded entity types. It fetches suggestions from a remote API and presents them in an easy-to-use dropdown, with automatic color-coding and legend generation for different entity types.


## Features

- **Dynamic Search**: Fetches suggestions based on user input
- **Debounced Search**: Reduces unnecessary API calls by introducing a debounce delay
- **Color-Coded Entity Types**: Automatically assigns and maintains consistent colors for different entity types
- **Dynamic Legend**: Shows all entity types and their corresponding colors
- **Customizable Styles**: Easily style the dropdown and entity labels to fit your UI design
- **Event Callbacks**: Provides hooks to interact with the selected entity
- **Rich Entity Labels**: Supports links, descriptions, and tooltips for entities
- **Multiple Value Retrieval Methods**: Get selected entities in various formats

## Installation

### Via CDN

Include EntityPad directly from a CDN:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://raw.githubusercontent.com/Sanket3dx/EntityPad/refs/heads/main/EntityPad.js"></script>
```

## Basic Usage

```html
<div id="myEditableDiv"></div>

<script>
    const editer = $('#myEditableDiv').EntityPad({
        api: {
            url: 'http://localhost:8080/entities',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer token123',
                'X-Custom-Header': 'value'
            },
            queryParams: {
                type: 'user',
                status: 'active'
            },
            dataType: 'json',
            cache: false,
            transformRequest: (data) => ({
                query: data.query,
                limit: 10
            }),
            transformResponse: (data) => data,
            beforeSend: (jqXHR, settings) => {
                // Custom logic before request
            },
            onError: (error, jqXHR) => {
                console.error('Failed to fetch suggestions:', error);
                if (jqXHR.status === 401) {
                    // Handle unauthorized
                }
            }
        },
        placeholder: "Type to search entities...",
        height: '40px',
        width: '300px',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        onSelect: function (entity) {
            console.log("Selected entity:", entity);
        },
    });
</script>
```

## API Response Format

Your API should return an array of entity objects with the following structure:

```javascript
[
    {
        id: "1",
        name: "Entity Name",
        description: "Entity Description",
        type: "person", // Entity type for color coding
        link: "https://optional-link.com" // Optional
    }
    // ... more entities
]
```

## Value Retrieval Methods

### Get Selected Entities

Returns an array of all selected entities:

```javascript
const entities = editer.getSelectedEntities();
// Returns:
[
    {
        id: "1",
        name: "Entity One",
        description: "Description of entity one"
    },
    {
        id: "2",
        name: "Entity Two",
        description: "Description of entity two"
    }
]
```

### Get Text with Entity Placeholders

Returns the text content with entities replaced by placeholders:

```javascript
const textAndEntities = editer.getTextAndEntities();
// Returns:
{
    formattedText: "Some text with entity {{abc12}} and another {{xyz34}}.",
    selectedEntities: {
        "abc12": {
            id: "1",
            name: "Entity One",
            description: "Description of entity one"
        },
        "xyz34": {
            id: "2",
            name: "Entity Two",
            description: "Description of entity two"
        }
    }
}
```

### Get Raw HTML

Returns the raw HTML content of the input field:

```javascript
const rowHTML = editer.getRowHTML();
// Returns:
'<span class="entity-label-1" data-entity-id="3" data-entity-desc="Description" data-entity-val="Entity Name" contenteditable="false">Entity Name</span>&nbsp;'
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `api.url` | String | `""` | The endpoint URL for fetching suggestions |
| `api.method` | String | `"GET"` | HTTP method for the API request |
| `api.headers` | Object | `{}` | Custom headers for the API request |
| `api.queryParams` | Object | `{}` | Additional query parameters |
| `api.dataType` | String | `"json"` | Expected response data type |
| `api.cache` | Boolean | `false` | Enable/disable API response caching |
| `debounceTime` | Number | `300` | Delay in milliseconds before sending API request |
| `placeholder` | String | `"Type here..."` | Placeholder text for empty input |
| `height` | String | `"40px"` | Height of the input field |
| `width` | String | `"100%"` | Width of the input field |
| `fontSize` | String | `"16px"` | Font size for the input field |
| `fontFamily` | String | `"Arial, sans-serif"` | Font family for the input field |

## Styling

EntityPad generates unique class names for each instance to prevent style conflicts. You can customize the appearance using CSS:

```css
/* Customize the input field */
.entity-suggest-div-1 {
    /* Your styles */
}

/* Customize entity labels */
.entity-label-1 {
    /* Your styles */
}

/* Customize the legend */
.entity-legend-1 {
    /* Your styles */
}
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
