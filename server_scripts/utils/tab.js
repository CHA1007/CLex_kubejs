const ELEMENTS = {
    priority: [
        'fire_element',
        'ice_element',
        'freeze_element',
        'water_element',
        'lightning_element',
        'nature_element',
        'catalyze_status'

    ],
    damageTypes: {
        'fire_magic': 'fire_element',
        'ice_magic': 'ice_element',
        'lightning_magic': 'lightning_element',
        'nature_magic': 'nature_element'
    },
    damageBonus:{
        'fire_magic': 'irons_spellbooks:fire_spell_power',
        'ice_magic': 'irons_spellbooks:ice_spell_power',
        'lightning_magic': 'irons_spellbooks:lightning_spell_power',
        'holy_magic': 'irons_spellbooks:holy_spell_power',
        'ender_magic': 'irons_spellbooks:ender_spell_power',
        'nature_magic': 'irons_spellbooks:nature_spell_power',
        'blood_magic': 'irons_spellbooks:blood_spell_power',
        'evocation_magic': 'irons_spellbooks:evocation_spell_power',
        'eldritch_magic': 'irons_spellbooks:eldritch_spell_power'
    },
    damageResist: {
        'fire_magic': 'irons_spellbooks:fire_magic_resist',
        'ice_magic': 'irons_spellbooks:ice_magic_resist',
        'lightning_magic': 'irons_spellbooks:lightning_magic_resist',
        'holy_magic': 'irons_spellbooks:holy_magic_resist',
        'ender_magic': 'irons_spellbooks:ender_magic_resist',
        'nature_magic': 'irons_spellbooks:nature_magic_resist',
        'blood_magic': 'irons_spellbooks:blood_magic_resist',
        'evocation_magic': 'irons_spellbooks:evocation_magic_resist',
        'eldritch_magic': 'irons_spellbooks:eldritch_magic_resist',
        'mob': 'kubejs:physical_damage_resist',
        'player': 'kubejs:physical_damage_resist'
    },
    levelAstral: {
        'minecraft:overworld': 50,
        'minecraft:the_nether': 100,
        'minecraft:the_end': 200
    }
};