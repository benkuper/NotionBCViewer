import { get, writable } from "svelte/store";

export const databases = writable(null);


export const currentVolunteer = writable(null);
export const currentShow = writable(null);
export const currentPlace = writable(null);
export const mode = writable("");

export const dayNames = ["Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const urlName = writable(null);
export const urlShow = writable(null);
export const urlPlace = writable(null);

export const showPastQuests = writable(true);

// GET DATA

fetch("https://benjamin.kuperberg.fr/bc2024/databases.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        pass: "mile4ever",
    }),
})
    .then((response) => response.json())
    .then((data) => {
        if (data.error != undefined) {
            console.error("Error fetching databse :", data.error);
            return;
        }

        databases.set(data);
    });




// ELEMENT GETTERS

export function getVolunteerByID(id) {
    if (!get(databases).volunteers) return null;
    return get(databases).volunteers.pages.find((volunteer) => volunteer.id == id);
}

export function getVolunteerByName(name) {
    if (!get(databases)) return null;
    return get(databases).volunteers.pages.find(
        (volunteer) =>
            volunteer.properties.Pseudo.title[0].plain_text
                .replace(/\s/g, "")
                .toLowerCase() == name.toLowerCase() ||
            volunteer.properties.Nom.rich_text[0].plain_text.trim() ==
            name ||
            volunteer.properties["Prénom"].rich_text[0].plain_text == name,
    );
}

export function getPlaceByID(id) {
    if (!get(databases).place) return null;
    return get(databases).place.pages.find((place) => place.id == id);
}

export function getPlaceByName(name) {
    if (!get(databases).places) return null;
    return get(databases).places.pages.find(
        (place) => place.properties.Name.title[0].plain_text.trim().toLowerCase() == name.toLowerCase()
    );
}

export function getShowByID(id) {
    if (!get(databases).show) return null;
    return get(databases).show.pages.find((show) => show.id == id);
}

export function getShowByName(name) {
    if (!get(databases).shows) return null;
    return get(databases).shows.pages.find(
        (show) =>
            show.properties.Nom.title[0].plain_text.trim().toLowerCase() == name.toLowerCase()
    );
}




// AFFECTATION

export function getVolunteerAffectations(volunteer) {
    return getAffectations((affectation) => {
        return affectation.properties["Bénévoles"].relation.some((person) => person.id == volunteer.id)
    });

}

export function getShowAffectations(show) {
    return getAffectations((affectation) => {
        let quest = getQuestByID(affectation.properties["Quête"].relation[0].id);
        return quest.properties["Spectacle"].relation.some((s) => s.id == show.id)
    });
}

export function getPlaceAffectations(place) {
    return getAffectations((affectation) => {
        return affectation.properties["Lieu Rollup"].rollup.array[0].relation[0].id == place.id;
    });
}

export function getAffectationIcon(affectation) {
    var quest = getQuestByID(
        affectation.properties["Quête"].relation[0].id,
    );
    var questType = getQuestTypeByID(
        quest.properties["Type de Quete"].relation[0].id,
    );
    return questType.icon.emoji;
}




//HELPERS

export function datePretty(date) {
    return new Date(date).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}


// GENERIC ACCESS FUNCTIONS


export function getQuestByID(id) {
    if (!databases) return null;
    return get(databases).quests.pages.find((quest) => quest.id == id);
}

export function getQuestTypeByID(id) {
    if (!databases) return null;
    return get(databases).questsTypes.pages.find((questType) => questType.id == id);
}


export function getAffectations(filter) {
    if (!get(databases)) return null;

    let dates = {};
    dayNames.forEach((dayName) => {
        dates[dayName] = [];
    });

    let closestDate = null;


    get(databases).affectations.pages.forEach((affectation) => {
        if (!filter(affectation)) return;

        const date = new Date(affectation.properties["Horaire"].date.start);
        const dateEnd = new Date(affectation.properties["Horaire"].date.end);
        
        let today = Date.now();// new Date("08/15/2024"); //for testing

        let dayName = dayNames[date.getDate() - 14];

        let dateItem = { affectation: affectation, isClosest: false };

        if (dateEnd < today) {
            if (!get(showPastQuests)) return;
            else dateItem.isPast = true;
        }

        //check if the date is the closest next
        if (
            dateEnd > today &&
            (closestDate == null || date < closestDate?.date)
        ) {
            closestDate = { date: date, data: dateItem };
        }

        if (dates[dayName]) dates[dayName].push(dateItem);
    }, []);



    if (closestDate) {
        closestDate.data.isClosest = true;
    }

    //sort by date
    Object.entries(dates).forEach(([dayName, date]) => {
        date.sort((a, b) => {
            return (
                new Date(a.affectation.properties["Horaire"].date.start) -
                new Date(b.affectation.properties["Horaire"].date.start)
            );
        });
    });

    //check overlapping affectations
    Object.entries(dates).forEach(([dayName, date]) => {
        date.forEach((affectation, index) => {
            if (index == 0) return;
            let previous = date[index - 1];
            let previousEnd = new Date(
                previous.affectation.properties["Horaire"].date.end,
            );
            let currentStart = new Date(
                affectation.affectation.properties["Horaire"].date.start,
            );
            if (previousEnd > currentStart) {
                previous.isOverlapping = true;
                affectation.isOverlapping = true;
            }
        });
    });

    return dates;
}