(function ($) {
    let instanceCounter = 0;

    $.fn.EntityPad = function (options) {
        instanceCounter++;
        const currentInstance = instanceCounter;

        const settings = $.extend(
            {
                api: {
                    url: "",
                    method: 'GET',
                    headers: {},
                    queryParams: {},
                    dataType: 'json',
                    contentType: 'application/json',
                    cache: false,
                    transformRequest: data => data,
                    transformResponse: data => data,
                    beforeSend: null,
                    onError: (error, jqXHR) => console.error('API Error:', error)
                },
                debounceTime: 300,
                placeholder: "Type here...",
                onSelect: function (entity) { },
                height: "40px",
                width: "100%",
                fontSize: "16px",
                fontFamily: "Arial, sans-serif"
            },
            options
        );
        class ApiHandler {
            constructor(config) {
                this.config = $.extend({
                    url: '',
                    method: 'GET',
                    headers: {},
                    queryParams: {},
                    dataType: 'json',
                    contentType: 'application/json',
                    beforeSend: null,
                    onError: null,
                    transformRequest: data => data,
                    transformResponse: data => data,
                    cache: false
                }, config);
            }

            request(data) {
                const queryParams = {
                    ...this.config.queryParams,
                    ...(this.config.method === 'GET' ? this.config.transformRequest(data) : {})
                };

                const url = this.buildUrl(this.config.url, queryParams);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: url,
                        method: this.config.method,
                        headers: this.config.headers,
                        dataType: this.config.dataType,
                        contentType: this.config.contentType,
                        cache: this.config.cache,
                        data: this.config.method !== 'GET' ?
                            this.formatRequestData(this.config.transformRequest(data)) :
                            undefined,
                        beforeSend: (jqXHR, settings) => {
                            if (typeof this.config.beforeSend === 'function') {
                                return this.config.beforeSend(jqXHR, settings);
                            }
                        },
                        success: (response, textStatus, jqXHR) => {
                            const transformedData = this.config.transformResponse(response);
                            resolve(transformedData);
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            if (typeof this.config.onError === 'function') {
                                this.config.onError(errorThrown, jqXHR);
                            }
                            reject(errorThrown);
                        }
                    });
                });
            }

            buildUrl(baseUrl, params = {}) {
                const url = new URL(baseUrl, window.location.origin);
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        url.searchParams.append(key, value);
                    }
                });
                return url.toString();
            }

            formatRequestData(data) {
                if (this.config.contentType === 'application/json') {
                    return JSON.stringify(data);
                }
                return data;
            }
        }

        const apiHandler = new ApiHandler(settings.api);

        const css = `
             .entity-suggest-div-${currentInstance} {
                min-height: ${settings.height};
                width: ${settings.width};
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 8px;
                font-size: ${settings.fontSize};
                line-height: 1.5;
                font-family: ${settings.fontFamily};
                background-color: #f9f9f9;
                position: relative;
                outline: none;
                box-sizing: border-box;
            }

            .entity-suggest-div-${currentInstance}:empty:before {
                content: "${settings.placeholder}";
                color: #aaa;
            }

            .entity-suggest-container-${currentInstance} {
                position: relative;
            }

            .entity-suggestions-${currentInstance} {
                position: absolute;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-height: 200px;
                overflow-y: auto;
                font-size: ${settings.fontSize};
                font-family: ${settings.fontFamily};
                z-index: 9999;
                box-sizing: border-box;
                display: none;
                min-width: 200px;
                backdrop-filter: blur(10px);
            }

            .entity-suggestion-item-${currentInstance} {
                padding: 8px 12px;
                cursor: pointer;
                color: #333;
                transition: all 0.2s ease;
                border-radius: 4px;
                margin: 2px 6px;
            }

            .entity-suggestion-item-${currentInstance}:hover {
                background-color: #007bff;
                color: #fff;
            }

            .entity-loader-${currentInstance} {
                position: absolute;
                bottom: 10px;
                right: 10px;
                width: 20px;
                height: 20px;
                display: none;
                z-index: 9999;
            }

            .entity-loader-${currentInstance}::after {
                content: '';
                width: 100%;
                height: 100%;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #007bff;
                border-radius: 50%;
                animation: spin-${currentInstance} 0.8s linear infinite;
                position: absolute;
                left: 0;
                top: 0;
            }

            @keyframes spin-${currentInstance} {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .entity-suggestion-item-${currentInstance}.highlighted {
                background-color: #007bff;
                color: white;
            }

            .entity-label-${currentInstance} {
                display: inline-block;
                padding: 3px 8px;
                background-color: #007bff;
                color: white;
                border-radius: 15px;
                margin: 0 2px;
                font-size: 0.9em;
                user-select: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        `;

        function injectCSS() {
            if (!document.getElementById(`entity-suggest-styles-${currentInstance}`)) {
                const style = document.createElement("style");
                style.id = `entity-suggest-styles-${currentInstance}`;
                style.textContent = css;
                document.head.appendChild(style);
            }
        }

        injectCSS();
        this.getSelectedEntities = function () {
            const $div = $(this);

            const selectedEntities = [];
            $div.children(`.entity-label-${currentInstance}`).each(function () {
                const entity = {
                    id: $(this).attr('data-entity-id'),
                    name: $(this).attr('data-entity-val'),
                    description: $(this).attr('data-entity-desc')
                }
                if (entity) {
                    selectedEntities.push(entity);
                }
            });

            return selectedEntities;
        };

        this.getTextAndEntities = function () {
            const $div = $(this);

            let formattedText = '';
            const selectedEntities = {};
            function generateRandomString() {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                for (let i = 0; i < 5; i++) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return result;
            }

            $div.contents().each(function () {
                if (this.nodeType === 3) {
                    formattedText += this.nodeValue;
                } else if (this.nodeType === 1 && $(this).hasClass(`entity-label-${currentInstance}`)) {
                    const entity = {
                        id: $(this).attr('data-entity-id'),
                        name: $(this).attr('data-entity-val'),
                        description: $(this).attr('data-entity-desc')
                    };

                    const randomKey = generateRandomString();
                    selectedEntities[randomKey] = entity;
                    formattedText += `{{${randomKey}}}`;
                }
            });

            return {
                formattedText,
                selectedEntities
            };
        };

        this.getRowHTML = function () {
            const $div = $(this);
            return $div[0].innerHTML;
        }


        return this.each(function () {
            const $div = $(this)
                .addClass(`entity-suggest-div-${currentInstance}`)
                .attr("contenteditable", "true")
                .data('instance-id', currentInstance);

            const $container = $("<div>").addClass(`entity-suggest-container-${currentInstance}`);
            const $loader = $("<div>").addClass(`entity-loader-${currentInstance}`).hide();
            const $suggestionsList = $("<ul>").addClass(`entity-suggestions-${currentInstance}`).hide();
            let lastKnownRange = null;
            let currentIndex = -1;
            let debounceTimer;

            $div.wrap($container).after($loader, $suggestionsList);
            $div.on('mouseup keyup', function (e) {
                if (e.type === 'keyup' && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
                    return;
                }
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    lastKnownRange = selection.getRangeAt(0).cloneRange();
                }
            });

            $div.on("input", function (event) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    lastKnownRange = selection.getRangeAt(0).cloneRange();
                }

                const currentNode = selection.getRangeAt(0).startContainer;
                let textToCheck;

                if (currentNode.nodeType === Node.TEXT_NODE) {
                    textToCheck = currentNode.textContent;
                } else {
                    const textNodes = Array.from(currentNode.childNodes).filter(node =>
                        node.nodeType === Node.TEXT_NODE
                    );
                    textToCheck = textNodes.length ? textNodes[textNodes.length - 1].textContent : '';
                }

                const query = getLastWord(textToCheck);

                if (query.length < 2) {
                    $suggestionsList.hide();
                    return;
                }

                clearTimeout(debounceTimer);
                $loader.show();

                debounceTimer = setTimeout(() => {
                    apiHandler.request({ query })
                        .then(data => {
                            $loader.hide();
                            if (data && data.length > 0) {
                                renderSuggestions(data, query, event.target);
                            } else {
                                $suggestionsList.hide();
                            }
                        })
                        .catch(() => {
                            $loader.hide();
                            $suggestionsList.hide();
                        });
                }, settings.debounceTime);
            });

            $div.on("keydown", function (event) {
                const $visibleSuggestions = $suggestionsList.find(`.entity-suggestion-item-${currentInstance}`);

                if ($suggestionsList.is(":visible")) {
                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        if (currentIndex < $visibleSuggestions.length - 1) {
                            currentIndex++;
                            highlightSuggestion(currentIndex);
                            ensureVisible($visibleSuggestions.eq(currentIndex));
                        }
                    } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        if (currentIndex > 0) {
                            currentIndex--;
                            highlightSuggestion(currentIndex);
                            ensureVisible($visibleSuggestions.eq(currentIndex));
                        }
                    } else if (event.key === "Enter" && currentIndex > -1) {
                        event.preventDefault();
                        const selectedEntity = $visibleSuggestions.eq(currentIndex).data("entity");
                        if (lastKnownRange) {
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(lastKnownRange.cloneRange());
                        }
                        insertEntityAsLabel($div[0], selectedEntity);
                        $suggestionsList.hide();
                        currentIndex = -1;
                        settings.onSelect(selectedEntity);
                    } else if (event.key === "Escape") {
                        event.preventDefault();
                        $suggestionsList.hide();
                        currentIndex = -1;
                    }
                }
            });

            function highlightSuggestion(index) {
                $(`.entity-suggestion-item-${currentInstance}`).removeClass("highlighted");
                $(`.entity-suggestion-item-${currentInstance}`).eq(index).addClass("highlighted");
            }

            function ensureVisible($element) {
                const container = $suggestionsList[0];
                const containerHeight = container.clientHeight;
                const containerScroll = container.scrollTop;
                const elementOffset = $element[0].offsetTop;
                const elementHeight = $element[0].clientHeight;

                if (elementOffset < containerScroll) {
                    // Scroll up to show element
                    container.scrollTop = elementOffset;
                } else if ((elementOffset + elementHeight) > (containerScroll + containerHeight)) {
                    // Scroll down to show element
                    container.scrollTop = elementOffset + elementHeight - containerHeight;
                }
            }


            function renderSuggestions(suggestions, query, editableDiv) {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                $suggestionsList.empty().show().css({
                    position: "fixed",
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX,
                });

                const windowHeight = window.innerHeight;
                const bottomSpace = windowHeight - rect.bottom;
                $suggestionsList.css('max-height', Math.min(200, bottomSpace - 10));

                suggestions.forEach((entity) => {
                    const $item = $("<li>")
                        .addClass(`entity-suggestion-item-${currentInstance}`)
                        .html(`<strong>${highlightMatch(entity.name, query)}</strong>`)
                        .data("entity", entity)
                        .on("mousedown", function (e) {
                            e.preventDefault();
                        })
                        .on("click", function (e) {
                            e.preventDefault();
                            const entity = $(this).data("entity");
                            if (lastKnownRange) {
                                const selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(lastKnownRange.cloneRange());
                            }
                            insertEntityAsLabel($div[0], entity);
                            $suggestionsList.hide();
                            currentIndex = -1;
                            settings.onSelect(entity);
                        });

                    $suggestionsList.append($item);
                });

                // Adjust position if off-screen
                const suggestionRect = $suggestionsList[0].getBoundingClientRect();
                if (suggestionRect.right > window.innerWidth) {
                    $suggestionsList.css('left', window.innerWidth - suggestionRect.width - 20);
                }
            }
            const typeColorMap = {};

            function getColorForType(type) {
                if (!typeColorMap[type]) {
                    // Generate a random color
                    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
                    typeColorMap[type] = randomColor;
                }
                return typeColorMap[type];
            }

            function insertEntityAsLabel(div, entity) {
                const labelNode = document.createElement('a');
                labelNode.className = `entity-label-${currentInstance}`;
                if (entity.link != "") {
                    labelNode.href = entity.link;
                    labelNode.target = "_blank";
                }
                labelNode.style.backgroundColor = getColorForType(entity.type);
                // Set attributes
                labelNode.setAttribute('data-entity-id', entity.id);
                labelNode.setAttribute('data-entity-desc', entity.description);
                labelNode.setAttribute('data-entity-val', entity.name);
                labelNode.contentEditable = false;
                labelNode.textContent = entity.name;

                // Set tooltip for description
                labelNode.title = entity.description; // Tooltip on hover

                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const currentNode = range.startContainer;

                if (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
                    const text = currentNode.textContent;
                    const cursorPosition = range.startOffset;
                    let lastSpaceIndex = text.lastIndexOf(' ', cursorPosition);

                    if (lastSpaceIndex === -1) {
                        lastSpaceIndex = text.lastIndexOf('\u00A0', cursorPosition);
                    }

                    const beforeText = text.substring(0, lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1);
                    const afterText = text.substring(cursorPosition);

                    const beforeTextNode = document.createTextNode(beforeText);
                    const afterTextNode = document.createTextNode(afterText);
                    const spaceNode = document.createTextNode('\u00A0');

                    if (beforeText) {
                        currentNode.parentNode.insertBefore(beforeTextNode, currentNode);
                    }
                    currentNode.parentNode.insertBefore(labelNode, currentNode);
                    currentNode.parentNode.insertBefore(spaceNode, currentNode);
                    if (afterText) {
                        currentNode.parentNode.insertBefore(afterTextNode, currentNode);
                    }
                    currentNode.parentNode.removeChild(currentNode);

                    const newRange = document.createRange();
                    newRange.setStartAfter(spaceNode);
                    newRange.setEndAfter(spaceNode);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }

                div.focus();
            }


            function getLastWord(text) {
                const trimmedText = text.trim();
                if (!trimmedText) return '';
                return trimmedText.split(/[\s\n]+/).filter(word => word.length > 0).pop() || '';
            }

            function highlightMatch(text, query) {
                const regex = new RegExp(`(${query})`, "gi");
                return text.replace(regex, "<a class='highlight'>$1</a>");
            }
        });
    };
})(jQuery);
