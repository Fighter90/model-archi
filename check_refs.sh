#!/bin/bash
echo "=== Проверка несуществующих ссылок ==="
# Извлекаем все archimateElement ссылки
grep -o 'archimateElement="[^"]*"' model_fitnes.archimate | sed 's/archimateElement="//;s/"$//' | sort -u > /tmp/used_refs.txt
# Извлекаем все ID элементов
grep -o 'id="[^"]*"' model_fitnes.archimate | sed 's/id="//;s/"$//' | sort -u > /tmp/defined_ids.txt
# Находим ссылки, которых нет в определениях
echo "Несуществующие ссылки:"
comm -23 /tmp/used_refs.txt /tmp/defined_ids.txt | grep -v '^conn-\|^rel-\|^grp-\|^view-\|^note-' | head -20
