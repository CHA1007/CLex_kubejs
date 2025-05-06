// 元素衰减处理
function processElementDecay(event, element) {
    const entities = event.server.getEntities().filter(entity =>
        entity.persistentData.contains(element)
    );

    entities.forEach(entity => {
        const current = entity.persistentData.getInt(element);

        // 元素衰减处理
        if (current > 0) {
            const newValue = Math.max(current - 10, 0);
            entity.persistentData.putInt(element, newValue);
        }

        // 元素消失处理
        if (entity.persistentData.getInt(element) === 0) {
            entity.persistentData.remove(element);
            let id = entity.getId();
            event.server.sendData(element + '_remove', { entityid: id });
        }
    });
}

/**
 * 湮灭减抗效果衰减处理
 * @param {event} event 
 */
function processStatusEffectDecay(event) {
    const entities = event.server.getEntities().filter(entity =>
        entity.persistentData.contains('annihilation_resistance_reduction')
    );
    entities.forEach(entity => {
        const current = entity.persistentData.getInt('annihilation_resistance_reduction');
        // 状态效果衰减处理
        if (current > 0) {
            const newValue = Math.max(current - 5, 0);
            entity.persistentData.putInt('annihilation_resistance_reduction', newValue);
        }
        // 状态效果消失处理
        if (entity.persistentData.getInt('annihilation_resistance_reduction') === 0) {
            const spellResistValue = entity.getAttribute('irons_spellbooks:spell_resist').getValue();
            entity.setAttributeBaseValue('irons_spellbooks:spell_resist', spellResistValue + 0.3);
            entity.persistentData.remove('annihilation_resistance_reduction');
            entity.persistentData.putBoolean('annihilation_resist_modified', false); // 重置标记
        }
    })
}

/**
 * 超导减抗效果衰减处理
 * @param {event} event 
 */
function processPenetrationDecay(event) {
    const entities = event.server.getEntities().filter(entity =>
        entity.persistentData.contains('physical_resistance_reduction')
    );
    entities.forEach(entity => {
        const current = entity.persistentData.getInt('physical_resistance_reduction');

        if (current > 0) {
            const newValue = Math.max(current - 5, 0);
            entity.persistentData.putInt('physical_resistance_reduction', newValue);
        }

        if (entity.persistentData.getInt('physical_resistance_reduction') === 0) {
            const physicalResistValue = entity.getAttribute('kubejs:physical_damage_resist').getValue();
            entity.setAttributeBaseValue('kubejs:physical_damage_resist', physicalResistValue + 0.6);
            entity.persistentData.remove('physical_resistance_reduction');
            entity.persistentData.putBoolean('physical_resistance_modified', false); // 重置标记
        }
    })
}
/**
 * 冻结抗性衰减处理
 * @param {event} event
 */
function freezeResistanceDecay(event) {
    const entities = event.server.getEntities().filter(entity =>
        entity.persistentData.contains('freeze_resistance')
    );
    entities.forEach(entity => {
        const current = entity.persistentData.getInt('freeze_resistance');
        if (current > 0) {
            const newValue = Math.max(current - 1, 0);
            entity.persistentData.putInt('freeze_resistance', newValue);
        } else {
            entity.persistentData.remove('freeze_resistance');
        }
    })
}


/**
 * 水中状态检测
 * @param {event} event 
 */
function checkWaterStatus(event) {
    event.server.getEntities().forEach(entity => {
        if (entity.inWaterOrRain) {
            entity.persistentData.putInt('water_element', 200);
            event.server.sendData('water_element', { entityid: entity.getId() });
            if (entity.persistentData.contains('fire_element')) {
                const newFireValue = Math.max(entity.persistentData.getInt('fire_element') - 200, 0);
                entity.persistentData.putInt('fire_element', newFireValue);
                console.log(newFireValue);
            }
            if (entity.persistentData.contains('catalyze_status')) {
                if (entity.persistentData.getInt('dewspark_layers') > 0){
                    entity.persistentData.putInt('dewspark_layers', entity.persistentData.getInt('dewspark_layers') + 1);
                }else{
                    entity.persistentData.putInt('catalyze_layers', 1);
                }
                consumeElement(event, 'catalyze_status', 200/2, 'water_element');
            }
            if (entity.persistentData.contains('nature_element')) {
                if (entity.persistentData.getInt('dewspark_layers') > 0){
                    entity.persistentData.putInt('dewspark_layers', entity.persistentData.getInt('dewspark_layers') + 1);
                }else{
                    entity.persistentData.putInt('catalyze_layers', 1);
                }
                consumeElement(event, 'nature_element', 200/2, 'water_element');
            }
        }
    });
}

/**
 * 冻结状态检测
 * @param {event} event 
 */
function checkFreezeStatus(event) {
    event.server.getEntities().forEach(entity => {
        if (entity.persistentData.contains('ice_element') && entity.persistentData.contains('water_element') && !entity.persistentData.contains('freeze_element')) {
            if (entity.isPlayer()) {
                const freezeResistanceLayers = entity.persistentData.getInt('freeze_resistance') || 0;
                entity.persistentData.putInt('freeze_element', (entity.persistentData.getInt('ice_element') * 2 * (1 - freezeResistanceLayers / 10)))
                entity.persistentData.putInt('ice_element', 0);
                entity.persistentData.putInt('water_element', 0);
                if (entity.persistentData.contains('freeze_resistance')) {
                    let resistance = entity.persistentData.getInt('freeze_resistance') + 1;
                    resistance = Math.min(resistance, 5);
                    entity.persistentData.putInt('freeze_resistance', resistance);
                } else {
                    entity.persistentData.putInt('freeze_resistance', 1);
                }

                entity.potionEffects.add('minecraft:slowness', 1000 , 255, false, false);
            } else {
                const freezeResistanceLayers = entity.persistentData.getInt('freeze_resistance') || 0;
                entity.persistentData.putInt('freeze_element', (entity.persistentData.getInt('ice_element') * 2 * (1 - freezeResistanceLayers / 10)))
                entity.persistentData.putInt('ice_element', 0);
                entity.persistentData.putInt('water_element', 0);
                if (entity.persistentData.contains('freeze_resistance')) {
                    let resistance = entity.persistentData.getInt('freeze_resistance') + 1;
                    resistance = Math.min(resistance, 5);
                    entity.persistentData.putInt('freeze_resistance', resistance);
                } else {
                    entity.persistentData.putInt('freeze_resistance', 1);
                }
                entity.setNoAi(true);

            }
        }
    });
}


/**
 * 冰冻元素衰减处理（每10tick减少40点）
 * @param {event} event 事件对象
 */
function freezeElementDecay(event) {
    const entities = event.server.getEntities().filter(entity => 
        entity.persistentData.contains('freeze_element')
    );
    
    entities.forEach(entity => {
        const current = entity.persistentData.getInt('freeze_element');
        const newValue = Math.max(current - 40, 0);
        
        entity.persistentData.putInt('freeze_element', newValue);
        
        if (newValue === 0) {
            entity.persistentData.remove('freeze_element');
            if (entity.isPlayer()) {
                entity.potionEffects.remove('minecraft:slowness');
            } else {
                entity.setNoAi(false);
            }
        }
    });
}

/**
 * 感电反应计算
 * @param {event} event 
 */
function electroReactio(event) {
    event.server.getEntities().forEach(entity => {
        if (entity.persistentData.contains('lightning_element') && entity.persistentData.contains('water_element')) {
            entity.persistentData.putInt('lightning_element', Math.max(entity.persistentData.getInt('lightning_element') - 80, 0));
            entity.persistentData.putInt('water_element', Math.max(entity.persistentData.getInt('water_element') - 80, 0));
            if (entity.persistentData.contains('electro_damage')) {
                entity.attack(entity.damageSources().magic(), entity.persistentData.getInt('electro_damage'))
            } else {
                entity.attack(entity.damageSources().magic(), ELEMENTS.levelAstral[entity.getLevel().getDimension()] || 0)
            }
        }
    })
}

/**
 * 处理燃烧反应
 * @param {event} event 
 */
function handleFireNatureInteraction(event) {
    event.server.getEntities().forEach(entity => {
        const elementKeys = Object.keys(entity.persistentData).filter(key => ELEMENTS.priority.includes(key));
        const hasFire = elementKeys.includes('fire_element');
        const hasNature = elementKeys.includes('nature_element');
        const onlyFireAndNature = elementKeys.length === 2 && hasFire && hasNature;

        if (onlyFireAndNature) {
            entity.attack(entity.damageSources().magic(), entity.persistentData.getInt('burn_damage'));
            // 刷新火元素附着值
            entity.persistentData.putInt('fire_element', 200);
        }
    });
}
/**
 * 处理蓄露层数
 * @param {event} event 
 */
function checkDewSparkLayer(event) {
    event.server.getEntities().forEach(entity => {
        if (entity.persistentData.contains('dewspark_time')) {
            entity.persistentData.putInt('dewspark_time', entity.persistentData.getInt('dewspark_time') - 10);
            if (entity.persistentData.getInt('dewspark_layers') > 10) {
                let level = entity.level;
                let pos = entity.position();

                let aabb = AABB.of(pos.x - 3, pos.y - 3, pos.z - 3, pos.x + 3, pos.y + 3, pos.z + 3);

                let targets = level.getEntitiesWithin(aabb);
                targets.forEach(target => {
                    if (target !== event.player && target.isAlive()) { // 改为排除攻击者
                        let dewSparkDamage = entity.persistentData.getInt('dewspark_damage');
                        target.attack(entity.damageSources().magic(), dewSparkDamage);

                    } else {
                        let dewSparkDamage = entity.persistentData.getInt('dewspark_damage');
                        target.attack(target.damageSources().magic(), dewSparkDamage * 0.05)


                    }
                })
                entity.persistentData.putInt('dewspark_layers', entity.persistentData.getInt('dewspark_layers') - 1);
            }
            if (entity.persistentData.getInt('dewspark_time') <= 0) {
                let level = entity.level;
                let pos = entity.position();

                let aabb = AABB.of(pos.x - 3, pos.y - 3, pos.z - 3, pos.x + 3, pos.y + 3, pos.z + 3);

                let targets = level.getEntitiesWithin(aabb);
                targets.forEach(target => {
                    if (target !== event.player && target.isAlive()) { // 改为排除攻击者
                        let dewSparkDamage = entity.persistentData.getInt('dewspark_damage') * entity.persistentData.getInt('dewspark_layers');
                        target.attack(entity.damageSources().magic(), dewSparkDamage);

                    } else {
                        let dewSparkDamage = entity.persistentData.getInt('dewspark_damage') * entity.persistentData.getInt('dewspark_layers');
                        target.attack(target.damageSources().magic(), dewSparkDamage * 0.05)
                    }
                })
                entity.persistentData.remove('dewspark_time');
                entity.persistentData.remove('dewspark_layers');
            }
        }
    });
}
/**
 * 处理5tick周期任务
 * @param {event} event 
 */
function tick5HandlePeriodicTasks(event) {
    if (event.server.tickCount % 5 === 0) {
        handleFireNatureInteraction(event);
    }
}

/**
 * 处理10tick周期任务
 * @param {event} event 
 */
function tick10HandlePeriodicTasks(event) {
    if (event.server.tickCount % 10 === 0) {
        // 元素类型循环
        ELEMENTS.priority.forEach(element => {
            processElementDecay(event, element)
        });

        checkWaterStatus(event)
        checkFreezeStatus(event)
        freezeElementDecay(event)
        checkDewSparkLayer(event)
        processStatusEffectDecay(event)
        processPenetrationDecay(event)
        electroReactio(event)
    }
}

/**
 * 处理10s周期任务
 * @param {event} event 
 */
function tick200HandlePeriodicTasks(event) {
    if (event.server.tickCount % 200 === 0) {
        freezeResistanceDecay(event)
    }
}

