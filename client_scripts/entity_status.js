const elements = [
    'fire_element',
    'ice_element',
    'freeze_element',
    'lightning_element',
    'water_element',
    'nature_element',
    'cataclysm_element'
];

elements.forEach(element => {
    NetworkEvents.dataReceived(`${element}`, (e) => {
        handleElementOperation(e, `${element}`, true);
    });

    NetworkEvents.dataReceived(`${element}_remove`, (e) => {
        handleElementOperation(e, `${element}`, false);
    });
});

function handleElementOperation(event, elementKey, isAdd) {
    const id = event.data.get("entityid");
    const entity = Client.level.getEntity(id);
    if (!entity) return;

    const persistentData = entity.getPersistentData();
    isAdd ? persistentData.putBoolean(elementKey, true)
        : persistentData.remove(elementKey);
}
