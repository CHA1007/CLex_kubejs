/**
 * 水元素反应
 * @param {event} event 事件对象
 * @param {string} element 当前元素类型
 * @returns {boolean} 是否发生了反应
 */
function waterElementReaction(event, element) {
    if (element !== 'water_element') return false;
    
    const entity = event.entity;
    const attacker = event.source.actual;
    const elementalMastery = attacker.getAttribute('kubejs:astral_benediction').getValue() | 0;
    const attackDamage = attacker.getAttribute('minecraft:generic.attack_damage').getValue() | 0;
    const originalDamage = event.getDamage();

}
