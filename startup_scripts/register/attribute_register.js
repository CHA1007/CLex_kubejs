global.attributes = {}
StartupEvents.registry('attribute', event => {
    // 星耀祝福属性
    global.attributes.ASTRAL_BENEDICTION = event.create('kubejs:astral_benediction', 'spell')
        .range(0, 0, 10000)
    
    // 物理伤害加成属性
    global.attributes.PHYSICAL_DAMAGE_BOOST = event.create('kubejs:physical_damage_boost','spell')
       .range(1, -10000, 10000)
    
    // 物理伤害抗性属性
    global.attributes.PHYSICAL_DAMAGE_RESIST = event.create('kubejs:physical_damage_resist','spell')
       .range(1, -10000, 10000)

    // 法术暴击率属性（0-1对应0%-100%）
    global.attributes.SPELL_CRIT_CHANCE = event.create('kubejs:spell_crit_chance', 'spell')
        .range(0.05, 0, 10000)

    // 法术暴击伤害属性（基础1.0倍，上限2.0倍）
    global.attributes.SPELL_CRIT_DAMAGE = event.create('kubejs:spell_crit_damage', 'spell')
        .range(0.5, 0, 10000)
})

NativeEvents.onEvent('net.neoforged.neoforge.event.entity.EntityAttributeModificationEvent', (event) => {
    event.types.forEach(type => {
        event.add(type, global.attributes.ASTRAL_BENEDICTION.get())
        
        event.add(type, global.attributes.PHYSICAL_DAMAGE_BOOST.get())
        event.add(type, global.attributes.PHYSICAL_DAMAGE_RESIST.get())

        event.add(type, global.attributes.SPELL_CRIT_CHANCE.get())
        event.add(type, global.attributes.SPELL_CRIT_DAMAGE.get())
    })
})