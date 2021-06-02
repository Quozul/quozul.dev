let copyCode = '';

function build(element, parent = "", deep = 0, code = "") {
    const base36 = document.getElementById('base36').checked;
    const fulltrim = document.getElementById('fulltrim').checked;
    const setAttribute = !document.getElementById('setAttribute').checked;
    const innerText = document.getElementById('innerText').checked;
    const separator = document.getElementById('separator').value;
    const ignoreData = document.getElementById('ignoreData').checked;
    const useQuotes = document.getElementById('useQuotes').checked;
    const comments = document.getElementById('comments').checked;

    function textNode(parent, varName, node) {
        let data = node.data.replace(/ +/g, ' ')
        if (fulltrim) data = data.trim();
        else data = data.replace(/\n|\r/g, '\\n');

        if (data.length > 0) {
            localCode += `const ${varName} = document.createTextNode(${quoteString(data)});\n`;

            if (parent.length > 0)
                localCode += `${parent}.append(${varName});\n`;
        }
    }

    function quoteString(str) {
        if (!useQuotes) return "`" + str + "`";

        const match = str.match(/^\${([^{}]+)}$/);
        if (match) return "\0" + match[1] + "\0";

        const quotes = str.match(/\${([^{}]*)}/g) === null ? '"' : '`';
        return quotes + str + quotes;
    }

    let localCode = "", i = 0;

    for (const child of element.childNodes) {
        i += 1;

        const tagName = child.tagName?.toLowerCase();

        let uid;

        if (separator.length === 0 && base36)
            uid = (parseInt(parseInt(deep, 36) + i.toString())).toString(36)
        else
            uid = deep.toString() + separator + (base36 ? i.toString(36) : i);

        const varName = `${tagName || child.nodeName.replace("#", "")}_${uid}`;

        if (element.childElementCount > 0) {
            switch (child.nodeType) {
                case 1:
                    if (comments) localCode += `// ${tagName} in ${parent}\n`;
                    localCode += `const ${varName} = document.createElement(${quoteString(tagName)});\n`;

                    for (const attribute of child.attributes) {
                        switch (attribute.name) {
                            case "class":
                                const classes = attribute.value.split(/ +/g).filter(c => c.length > 0).map(c => quoteString(c)).join(", ");
                                localCode += `${varName}.classList.add(${classes});\n`;
                                break;

                            case "name": case "id": case "checked": case "value": case "disabled":
                            case "type": case "action": case "method": case "form": case "href":
                            case "src": case "target": case "loaoding":
                                localCode += `${varName}.${attribute.name} = ${quoteString(attribute.value)};\n`
                                break;

                            case "for":
                                localCode += `${varName}.htmlFor = ${quoteString(attribute.value)};\n`
                                break;

                            case "style":
                                if (setAttribute)
                                    attribute.value.trim().split(';').forEach(s => {
                                        [name, value] = s.split(':');
                                        if (name.length > 0 && value.length > 0) {
                                            const propertyName = name.trim().replace(/(\-\w)/g, m => m[1].toUpperCase());
                                            const propertyValue = value.trim();
                                            localCode += `${varName}.style.${propertyName} = ${quoteString(propertyValue)};\n`;
                                        }
                                    });
                                else
                                    localCode += `${varName}.setAttribute(${quoteString(attribute.name)}, ${quoteString(attribute.value)});\n`;
                                break;

                            default:
                                if (ignoreData && attribute.name.startsWith("data-")) continue;
                                localCode += `${varName}.setAttribute(${quoteString(attribute.name)}, ${quoteString(attribute.value)});\n`;
                                break;
                        }
                    }

                    localCode += build(child, varName, uid.toString(), code);

                    if (innerText && child.childElementCount === 0 && child.innerText.length > 0) {
                        let data = child.innerText;
                        if (fulltrim) data = data.trim();
                        else data = data.replace(/\n|\r/g, '\\n');
                        localCode += `${varName}.innerText = ${quoteString(data)};\n`;
                    }

                    if (parent.length > 0)
                        localCode += `${parent}.append(${varName});\n`;

                    break;
                case 3:
                    textNode(parent, varName, child);
                    break;
            }

            localCode += "\n";
        } else {
            if (!innerText || child.parentElement.childElementCount > 0)
                textNode(parent, varName, child);
        }
    }

    return localCode;
}

function convert() {
    const html = document.getElementById("html").value;
    const element = document.createElement("div");
    element.innerHTML = html;

    document.getElementById('res').innerHTML = "";

    let code = "function buildElement(parent) {\n";
    code += "  " + build(element, "parent").trim().replace(/\n{2,}/g, "\n\n").replace(/\n/g, "\n  ");
    code += "\n}";

    document.getElementById('code').innerText = code.replace(/\0/g, '');
    copyCode = code;

    code += "\nbuildElement(document.getElementById('res'));";

    const matches = code.match(/\${([^{}]*)}/g) ?? [];
    for (const match of matches) {
        const content = match.match(/\${([^{}]*)}/)[1];
        code = code.replace(match, `{${content}}`);
    }

    eval(code.replace(/\0/g, '"'));
}

function copy() {
    navigator.clipboard.writeText(copyCode);
}

convert();