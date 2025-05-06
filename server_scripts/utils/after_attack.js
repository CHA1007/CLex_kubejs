/**
 * 元素附着处理
 * @param {event} event 事件对象
 * @returns 
 */
function handleElementAttachment(event) {
    let element = event.source.getType();
    if (global.SPELLTYPES.includes(element)) {
        event.entity.persistentData.put(ELEMENTS.damageTypes[element], 200);//暂时固定200
        event.server.sendData(ELEMENTS.damageTypes[element], { entityid: event.entity.getId() });
    }
}