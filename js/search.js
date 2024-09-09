const register = {
    // Register an event for the next and previous button clicks to facilitate pagination
    Pagination: () => {
        const nextPage = document.querySelector('#nextPage')
        const prevPage = document.querySelector('#prevPage')
        const pageSize = document.querySelector('#pageSize')

        const commonClick = (increment) => {
            if (window.SearchObject) {
                increment ? window.SearchObject.page++ : window.SearchObject.page--;
                bindings.displayPage()
            }
        }

        pageSize.addEventListener('change', (e) => {
            let perPage = parseInt(e.target.value)
            if (!perPage) {
                perPage = Number.MAX_SAFE_INTEGER
            }

            window.SearchObject.limit = perPage
            bindings.displayPage()
        })

        nextPage.addEventListener('click', () => {
            commonClick(true)
        })
        prevPage.addEventListener('click', () => {
            commonClick(false)
        })
    }
}

const init = {
    // Initializes global window data.
    // Include references to global data in the browser's window object
    window: () => {
        if (!window.SearchObject) {
            window.SearchObject = {
                text: document.getElementById('search-input').value,
                field: document.getElementById('field').value,
                operator: getSelectedOperator(),
                limit: 20,

                sortField: "name",
                sortType: "ascending",
                page: 1,
            }
        }
    },

    // Loads all the Hero's data from its original URL, if it has not yet been retrieved.
    // It then calls all the other data bindings to load the data to a table
    loadHeroData: () => {
        const url = 'https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json'
        fetch(url)
            .then(
                response => {
                    response.json().then(heroes => {
                        window.HeroData = heroes
                        window.DisplayData = heroes
                        updateSearchObject()
                    })
                },
                failure => {
                    if (init.retries < 5) {
                        init.retries++
                        console.log('Failed to fetch all.json:', failure)
                        console.log('Retrying in a second...')
                        setTimeout(init.loadHeroData, 1000);
                    } else {
                        console.log('Failed to fetch all.json after five retries, giving up!!')
                        console.log(failure)
                    }
                },
            );
    },

    retries: 0,
}

const bindings = {
    // The currently displayed page number will be displayed in the element: #pageNumber.
    // The page number is stored and can be accessed from `window.SearchObject.page` property
    updatePageNumber: function () {
        const currentPage = window.SearchObject.page
        const pageNumber = document.querySelector('#pageNumber')
        pageNumber.textContent = currentPage.toString()
    },

    /*
    * Displays the current page of heroes to the table based on the current active filter.
    * Note: This does not check if the other query parameters than the `window.SearchObject.page` have changed
    */
    displayPage: () => {
        const paginate = (array, pageSize, pageNumber) => {
            const startIndex = (pageNumber - 1) * pageSize;
            let endIndex = startIndex + pageSize;
            endIndex = Math.min(endIndex, array.length);
            return array.slice(startIndex, endIndex);
        }

        const hasPage = (array, pageSize, pageNumber) => {
            return pageNumber.length !== 0
        }

        const pageSize = window.SearchObject.limit;
        const pageNumber = window.SearchObject.page;
        const DisplayData = paginate(window.DisplayData, pageSize, pageNumber)
        const tableContainer = document.getElementById('table-container')
        if (!DisplayData || DisplayData.length === 0) {
            tableContainer.style.display = 'none'
        } else {
            tableContainer.style.display = 'block'
        }

        /**
         * @returns {HTMLTableRowElement}
         * @param {Superhero} superhero
         */
        function createUserRow(superhero) {
            const userInfoCell = document.createElement('td');
            const userInfoDiv = document.createElement('div');
            userInfoDiv.classList.add('user-info');

            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('avatar');
            avatarDiv.style.backgroundImage = `url(${superhero.images.xs})`;

            const nameText = document.createTextNode(superhero.name);

            userInfoDiv.appendChild(avatarDiv);
            userInfoDiv.appendChild(nameText);
            userInfoCell.appendChild(userInfoDiv);

            const row = document.createElement('tr');
            // console.log('url:', superhero.images.xs)
            // row.innerHTML = `
            //         <td>
            //             <div class="user-info">
            //                 <div class="avatar" style="background-image: url("${superhero.images.xs}");"></div>
            //                 ${superhero.name}
            //             </div>
            //         </td>
            //         <td>${superhero.biography.fullName}</td>
            //         <td>${superhero.powerstats.combat}</td>
            //         <td>${superhero.powerstats.durability}</td>
            //         <td>${superhero.powerstats.intelligence}</td>
            //         <td>${superhero.powerstats.power}</td>
            //         <td>${superhero.powerstats.speed}</td>
            //         <td>${superhero.powerstats.strength}</td>
            //         <td>${superhero.appearance.race}</td>
            //         <td>${superhero.appearance.gender}</td>
            //         <td>${superhero.appearance.height[0]}</td>
            //         <td>${superhero.appearance.weight[0]}</td>
            //         <td>${superhero.biography.placeOfBirth}</td>
            //         <td>${superhero.biography.alignment}</td>
            //     `;
            // My
            row.append(userInfoCell)
            row.innerHTML += `
                <td>${superhero.biography.fullName}</td>
                <td>${superhero.powerstats.combat}</td>
                <td>${superhero.powerstats.durability}</td>
                <td>${superhero.powerstats.intelligence}</td>
                <td>${superhero.powerstats.power}</td>
                <td>${superhero.powerstats.speed}</td>
                <td>${superhero.powerstats.strength}</td>
                <td>${superhero.appearance.race}</td>
                <td>${superhero.appearance.gender}</td>
                <td>${superhero.appearance.height[1]}</td>
                <td>${superhero.appearance.weight[1]}</td>
                <td>${superhero.biography.placeOfBirth}</td>
                <td>${superhero.biography.alignment}</td>
        `
            // My

            row.onclick = () => {
                console.log(`Clicked on ${superhero.name}'s row:`, superhero);
            };

            return row;
        }

        const tableBody = document.getElementById('heroTableBody');
        tableBody.innerHTML = ''
        DisplayData.forEach(user => {
            tableBody.appendChild(createUserRow(user));
        });

        const pageNext = document.querySelector('#nextPage')
        const pagePrev = document.querySelector('#prevPage')

        pageNext.enabled = hasPage(window.DisplayData, pageSize, pageNumber+1)
        pagePrev.enabled = hasPage(window.DisplayData, pageSize, pageNumber-1)

        // we displayed yet another table, update the page number
        bindings.updatePageNumber()

        // TODO: scroll the top of the table
    },
}

document.addEventListener('DOMContentLoaded', function () {
    // First initialize global window data, we'll run into reference errors before initialization
    init.window()
    register.Pagination()

    // Start with the recommended page number, rather than the template's
    bindings.updatePageNumber()

    init.loadHeroData()

    document.addEventListener('click', (e) => {
        const doFor = (to, textContent) => {
            if (e.target.textContent === textContent) {
                if (window.SearchObject.sortField === to) {
                    window.SearchObject.sortType = negate(window.SearchObject.sortType)
                } else {
                    window.SearchObject.sortField = to
                    window.SearchObject.sortType = 'ascending'
                }

                updateSearchObject()
            }
        }
        doFor('name', 'Name')

        doFor('powerstats.strength', 'Strength')
        doFor('powerstats.speed', 'Speed')
        doFor('powerstats.intelligence', 'Intelligence')
        doFor('powerstats.power', 'Power')
        doFor('powerstats.durability', 'Durability')
        doFor('powerstats.combat', 'Combat')

        doFor('biography.alignment', 'Alignment')
        doFor('biography.placeOfBirth', 'PlaceOfBirth')
        doFor('biography.fullName', 'Full Name')

        doFor('appearance.weight', 'Weight')
        doFor('appearance.race', 'Race')
        doFor('appearance.height', 'Height')
        doFor('appearance.gender', 'Gender')
    })

    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedOptions = document.getElementById('advanced-options');
    advancedToggle.addEventListener('click', function () {
        if (advancedOptions.style.display === 'none' || advancedOptions.style.display === '') {
            advancedOptions.style.display = 'block';
            advancedToggle.textContent = 'arrow_drop_up';
        } else {
            advancedOptions.style.display = 'none';
            advancedToggle.textContent = 'arrow_drop_down';
        }
    });

    const inputElement = document.getElementById('search-input');
    inputElement.addEventListener('input', (event) => {
        const newValue = event.target.value;
        console.log("New value:", newValue);
        updateSearchObject()
    });

    const selectElement = document.getElementById('field');
    selectElement.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        console.log("Selected value:", selectedValue);
        updateSearchObject()
    });

    const searchOperatorRadios = document.querySelectorAll('input[name="search_operator"]');
    searchOperatorRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            advancedToggle.click()
            updateSearchObject()
        });
    });
});


function negate(s) {
    if (s === 'ascending') {
        return "descending"
    }
    return 'ascending'
}

window.SearchObject = {
    text: "",
    field: "name",
    operator: "",

    sortField: "name",
    sortType: "ascending",
    limit: 20,
    page: 1,
}
window.HeroData = []

/**
 * Once you update this object, you must call {updateTableDisplay}
 * @type {Superhero[]}
 */
window.DisplayData = []
window.fetchInProgress = false

function updateSearchObject() {
    window.SearchObject.text = document.getElementById('search-input').value
    window.SearchObject.field = document.getElementById('field').value
    window.SearchObject.operator = getSelectedOperator()

    console.log('Searching:', window.SearchObject)
    const SearchObject = window.SearchObject;
    const ops = {
        include: (negate) => {
            window.DisplayData = window.HeroData.filter((hero) => {
                const propVal = getHeroProp(hero, window.SearchObject.field)
                if (!propVal) return false;
                let boolResult;
                if (negate) {
                    boolResult = !propVal.includes(SearchObject.text)
                } else {
                    boolResult = propVal.includes(SearchObject.text)
                }
                return boolResult
            })
        },

        exclude: () => {
            ops.include(true)
        }
    }

    if (SearchObject.text === "") {
        // If the search text is empty, then display all the results
        window.DisplayData = window.HeroData
    } else {
        switch (SearchObject.operator) {
            case "include": {
                ops.include()
                break;
            }
            case "exclude": {
                ops.exclude()
                break;
            }
            default:
                window.DisplayData = []
        }
    }

    window.DisplayData.sort(heroesCompareFn(SearchObject.sortField))
    if (SearchObject.sortType !== 'ascending') {
        window.DisplayData.reverse()
    }

    console.log('Results (Search):', window.DisplayData)

    // Display the current page of items
    bindings.displayPage()
}

function heroesCompareFn(prop) {
    return function (a, b) {
        let valA = getHeroProp(a, prop)
        let valB = getHeroProp(b, prop)

        const valFromString = (v) => {
            if (typeof v === "string") {
                const splits = v.split(' ')
                if (splits.length !== 0) {
                    return parseFloat(splits[0])
                }
            }
            return 0;
        }

        if (prop === 'appearance.weight' || prop === 'appearance.height') {
            valA = valFromString(valA)
            valB = valFromString(valB)
        }

        if (valA === undefined || valA === null || valA === '-' || valA === "" || valA === 0) {
            return 1
        }

        if (valB === undefined || valB === null || valB === '-' || valB === "" || valB === 0) {
            return -1
        }

        if (valA < valB) {
            return -1;
        } else if (valA > valB) {
            return 1;
        } else {
            return 0;
        }
    }
}

/**
 *
 * @param {Superhero} hero
 * @param {string} prop
 */
function getHeroProp(hero, prop) {
    if (prop === 'name') {
        return hero.name
    } else if (prop === 'powerstats.strength') {
        return hero.powerstats.strength
    } else if (prop === 'powerstats.speed') {
        return hero.powerstats.speed
    } else if (prop === 'powerstats.intelligence') {
        return hero.powerstats.intelligence
    } else if (prop === 'powerstats.power') {
        return hero.powerstats.power
    } else if (prop === 'powerstats.durability') {
        return hero.powerstats.durability
    } else if (prop === 'powerstats.combat') {
        return hero.powerstats.combat
    } else if (prop === 'biography.alignment') {
        return hero.biography.alignment
    } else if (prop === 'biography.placeOfBirth') {
        return hero.biography.placeOfBirth
    } else if (prop === 'biography.fullName') {
        return hero.biography.fullName
    } else if (prop === 'appearance.weight') {
        return hero.appearance.weight[1]
    } else if (prop === 'appearance.race') {
        return hero.appearance.race
    } else if (prop === 'appearance.height') {
        return hero.appearance.height[1]
    } else if (prop === 'appearance.gender') {
        return hero.appearance.gender
    } else {
        console.log('unhandled case:', prop)
    }
}

function getSelectedOperator() {
    const radios = document.querySelectorAll('input[name="search_operator"]');
    let selectedValue = "";
    for (const radio of radios) {
        if (radio.checked) {
            selectedValue = radio.value;
            break;
        }
    }

    return selectedValue
}

// Icon            (.images.xs, should be displayed as images and not as a string)
// Name           (.name)
// Full Name      (.biography.fullName)
// Powerstats     (each entry of .powerstats)
// Race           (.appearance.race)
// Gender         (.appearance.gender)
// Height         (.appearance.height)
// Weight         (.appearance.weight)
// Place Of Birth (.biography.placeOfBirth)
// Alignment       (.biography.alignment)

/**
 * Represents a superhero character with various attributes.
 */
class Superhero {
    /**
     * Creates a new Superhero instance.
     *
     * @param {number} id - The unique identifier of the superhero.
     * @param {string} name - The superhero's name.
     * @param {string} slug - The superhero's URL slug.
     * @param {Powerstats} powerstats - The superhero's power statistics.
     * @param {Appearance} appearance - The superhero's physical appearance.
     * @param {Biography} biography - The superhero's biographical information.
     * @param {Work} work - The superhero's work information.
     * @param {Connections} connections - The superhero's connections and relationships.
     * @param {Images} images - The superhero's image URLs in different sizes.
     */
    constructor(
        id,
        name,
        slug,
        powerstats,
        appearance,
        biography,
        work,
        connections,
        images
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.powerstats = powerstats;
        this.appearance = appearance;
        this.biography = biography;
        this.work = work;
        this.connections = connections;
        this.images = images;
    }
}

/**
 * Represents the superhero's power statistics.
 */
class Powerstats {
    /**
     * Creates a new Powerstats instance.
     *
     * @param {number} intelligence - Intelligence score.
     * @param {number} strength - Strength score.
     * @param {number} speed - Speed score.
     * @param {number} durability - Durability score.
     * @param {number} power - Power score.
     * @param {number} combat - Combat score.
     */
    constructor(intelligence, strength, speed, durability, power, combat) {
        this.intelligence = intelligence;
        this.strength = strength;
        this.speed = speed;
        this.durability = durability;
        this.power = power;
        this.combat = combat;
    }
}

/**
 * Represents the superhero's physical appearance.
 */
class Appearance {
    /**
     * Creates a new Appearance instance.
     *
     * @param {string} gender - The superhero's gender.
     * @param {string} race - The superhero's race.
     * @param {string[]} height - The superhero's height in different units.
     * @param {string[]} weight - The superhero's weight in different units.
     * @param {string} eyeColor - The superhero's eye color.
     * @param {string} hairColor - The superhero's hair color.
     */
    constructor(gender, race, height, weight, eyeColor, hairColor) {
        this.gender = gender;
        this.race = race;
        this.height = height;
        this.weight = weight;
        this.eyeColor = eyeColor;
        this.hairColor = hairColor;
    }
}

/**
 * Represents the superhero's biographical information.
 */
class Biography {
    /**
     * Creates a new Biography instance.
     *
     * @param {string} fullName - The superhero's full name.
     * @param {string} alterEgos - Information about the superhero's alter egos.
     * @param {string[]} aliases - The superhero's aliases.
     * @param {string} placeOfBirth - The superhero's place of birth.
     * @param {string} firstAppearance - The superhero's first appearance in comics.
     * @param {string} publisher - The superhero's publisher.
     * @param {string} alignment - The superhero's alignment (good, bad, neutral).
     */
    constructor(
        fullName,
        alterEgos,
        aliases,
        placeOfBirth,
        firstAppearance,
        publisher,
        alignment
    ) {
        this.fullName = fullName;
        this.alterEgos = alterEgos;
        this.aliases = aliases;
        this.placeOfBirth = placeOfBirth;
        this.firstAppearance = firstAppearance;
        this.publisher = publisher;
        this.alignment = alignment;
    }
}

/**
 * Represents the superhero's work information.
 */
class Work {
    /**
     * Creates a new Work instance.
     *
     * @param {string} occupation - The superhero's occupation.
     * @param {string} base - The superhero's base of operations.
     */
    constructor(occupation, base) {
        this.occupation = occupation;
        this.base = base;
    }
}

/**
 * Represents the superhero's connections and relationships.
 */
class Connections {
    /**
     * Creates a new Connections instance.
     *
     * @param {string} groupAffiliation - The superhero's group affiliations.
     * @param {string} relatives - The superhero's relatives.
     */
    constructor(groupAffiliation, relatives) {
        this.groupAffiliation = groupAffiliation;
        this.relatives = relatives;
    }
}

/**
 * Represents the superhero's image URLs in different sizes.
 */
class Images {
    /**
     * Creates a new Images instance.
     *
     * @param {string} xs - Extra small image URL.
     * @param {string} sm - Small image URL.
     * @param {string} md - Medium image URL.
     * @param {string} lg - Large image URL.
     */
    constructor(xs, sm, md, lg) {
        this.xs = xs;
        this.sm = sm;
        this.md = md;
        this.lg = lg;
    }
}
