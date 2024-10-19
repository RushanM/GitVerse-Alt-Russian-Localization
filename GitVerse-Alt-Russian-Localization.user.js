// ==UserScript==
// @name         Русская локализация GitVerse от Дефлекты
// @namespace    http://tampermonkey.net/
// @version      1.B1
// @description  Альтернативная русская локализация GitVerse
// @author       Дефлекта
// @match        https://gitverse.ru/*
// @grant        none
// @run-at       document-end
// @icon         https://gitverse.ru/favicon-32x32.png
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Список замен в виде объектов с регулярным выражением и строкой замены
     */
    const replacements = [
        // Дашборд
        { regex: /Добавлены коммиты/g, replacement: 'внёс изменения в ветку' },
        { regex: /Удалена ветка/g, replacement: 'удалил ветку' },
        { regex: /Политика использования «cookies»/g, replacement: 'Политика использования куки' },
        { regex: /Добавить/g, replacement: 'Создать' },
        { regex: /Гитпес/g, replacement: 'Гитпёс' },
        // Репозиторий
        { regex: /Релизы/g, replacement: 'Выпуски' },
        { regex: /Beta/g, replacement: 'Бета' },
        { regex: /Коммиты\s*[:：]\s*(\d+)/g, replacement: '$1 правок' },
        { regex: /Поиск по названию релиза/g, replacement: 'Поиск по названию выпуска' },
    ];

    /**
     * Функция для замены текста в текстовых узлах
     * @param {Node} node — текущий узел
     */
    function replaceText(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue;

            // Журналирование для отладки
            if (text.includes('Коммиты') || text.includes('Beta')) {
                console.log('Текущее текстовое содержимое:', text);
            }

            replacements.forEach(({ regex, replacement }) => {
                text = text.replace(regex, replacement);
            });

            if (text !== node.nodeValue) {
                console.log(`Замена текста: "${node.nodeValue}" на "${text}"`);
                node.nodeValue = text;
            }
        }
    }

    /**
     * Функция для замены текста в атрибутах элементов
     * @param {Element} element — текущий элемент
     */
    function replaceAttributes(element) {
        const attributesToCheck = ['placeholder', 'title', 'aria-label', 'value', 'alt'];

        attributesToCheck.forEach(attr => {
            if (element.hasAttribute(attr)) {
                let attrValue = element.getAttribute(attr);
                let originalAttrValue = attrValue;

                replacements.forEach(({ regex, replacement }) => {
                    attrValue = attrValue.replace(regex, replacement);
                });

                if (attrValue !== originalAttrValue) {
                    console.log(`Замена атрибута ${attr}: "${originalAttrValue}" на "${attrValue}"`);
                    element.setAttribute(attr, attrValue);
                }
            }
        });
    }

    /**
     * Функция для замены текста внутри элементов без дочерних тегов
     * @param {Element} element — текущий элемент
     */
    function replaceElementText(element) {
        if (element.children.length === 0) { // Обработка только элементов без дочерних тегов
            let text = element.textContent;

            replacements.forEach(({ regex, replacement }) => {
                const newText = text.replace(regex, replacement);
                if (newText !== text) {
                    console.log(`Замена внутри элемента: "${text}" на "${newText}"`);
                    element.textContent = newText;
                    text = newText; // Обновить текст для последующих замен
                }
            });
        }
    }

    /**
     * Рекурсивная функция для обхода DOM и замены текста и атрибутов
     * @param {Node} node — текущий узел
     */
    function walkAndReplace(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            if (['script', 'style', 'noscript'].includes(tag)) {
                return; // Пропуск этих элементов
            }

            // Замена текста в атрибутах
            replaceAttributes(node);

            // Замена текста внутри элементов без дочерних тегов
            replaceElementText(node);
        }

        // Замена текста в текстовых узлах
        if (node.nodeType === Node.TEXT_NODE) {
            replaceText(node);
        }

        // Обход потомков
        let child = node.firstChild;
        while (child) {
            let next = child.nextSibling;
            walkAndReplace(child);
            child = next;
        }
    }

    // Начальный обход DOM после загрузки страницы
    walkAndReplace(document.body);

    // Настройка MutationObserver для отслеживания изменений в DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                walkAndReplace(node);
            });
        });
    });

    // Запуск наблюдателя
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();