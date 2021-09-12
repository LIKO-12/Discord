import Discord from 'discord.js';
import * as api from './liko-api';

/**
 * Generates example code for a method.
 * @param parent (Optional) The name of the contianer which the method belongs to.
 * @param name The name of the method.
 * @param self Whether the method uses ':' or '.' to be called.
 * @param args The arguments of the method if it has some.
 * @param returns The return values of the method if it has some.
 * @returns The generated usage line.
 */
function generateExampleCode(parent: string | undefined, name: string, self: boolean | undefined, args: api.Argument[] | undefined, returns: api.ReturnValue[] | undefined): string {
    const exampleCode = [];

    if (returns) exampleCode.push(returns.map((ret) => ret.name).join(', ') + ' = '); // 'ret1, ret2, ... = '
    if (parent) exampleCode.push(parent + (self ? ':' : '.')); // 'GPU.'
    exampleCode.push(name + '('); // '_systemMessage('
    if (args) exampleCode.push(args.map((arg) => api.isLiteralArgument(arg) ? arg.default : (arg.default ? `[${arg.name}]` : arg.name)).join(', ')); // 'arg1, arg2, ...'
    exampleCode.push(')'); // ')'

    return exampleCode.join('');
}

/**
 * Formats a markdown string representing the type.
 * @param types The type to format.
 */
function formatType(types: api.LuaType): string {
    if (api.isSingleType(types)) types = [types];
    const formatted: string[] = [];

    for (const type of types) {
        if (api.isSimpleType(type)) {
            formatted.push(type);
        } else {
            const peripheral = type[1], objectName = type[3];
            formatted.push(`[${peripheral}/${objectName}](https://https://liko-12.github.io/WIP/docs/peripherals_${peripheral.toLowerCase()}_${objectName.toLowerCase()})`);
        }
    }

    return formatted.join(', ');
}

/**
 * Formats an argument into a string.
 * @param argument The argument to format.
 */
function formatArgument(argument: api.Argument): string {
    if (api.isLiteralArgument(argument)) {
        let result: string = `\`${argument.default}\` **(**${formatType(argument.type)}**)**`;
        if (argument.description) result += ': ' + argument.description;
        return result;
    } else {
        let result: string = `**${argument.name} (**${formatType(argument.type)}**)**`;
        if (argument.default === 'nil') result += ` **(**Optional**)**`;
        else if (argument.default) result += ` **(**Default \`${argument.default}\`**)**`;
        if (argument.description) result += ': ' + argument.description;
        return result;
    }
}

/**
 * Formats a group of arguments into a list.
 * @param args The arguments to format.
 */
function formatArguments(args: api.Argument[]): string {
    return args.map(argument => '• ' + formatArgument(argument)).join('\n')
}

/**
 * Checks whether a string represents a literal Lua value or not.
 * @param value The string to check.
 */
function isLiteralValue(value: string): boolean {
    if (value == 'nil') return true;
    if (value == 'false' || value == 'true') return true;
    if (value.startsWith('"') || value.startsWith("'")) return true;
    if (Number.parseInt(value)) return true;
    return false;
}

/**
 * Formats a return value into a string.
 * @param ret The return value to format.
 */
function formatReturn(ret: api.ReturnValue): string {
    let result: string = isLiteralValue(ret.name) ? `\`${ret.name}\`` : `**${ret.name}**`;
    result += ` **(**${formatType(ret.type)}**)**`;
    if (ret.description) result += ': ' + ret.description;
    return result;
}

/**
 * Formats a group of return values into a list.
 * @param returns The return values to format.
 */
function formatReturns(returns: api.ReturnValue[]): string {
    return returns.map(ret => '• ' + formatReturn(ret)).join('\n');
}

/**
 * Creates a Discord embed for a method's documentation.
 * @param opts Method object with usageId containing method's properties.
 * @returns The created discord embed.
 */
export function createMethodEmbed(/*peripheral: string, object: string | undefined, name: string, method: api.LuaMethod, usageId?: number | undefined*/opts: { peripheral: string, object: string | undefined, name: string, method: api.LuaMethod, usageId?: number | undefined  }): Discord.MessageEmbed { // TODO: requires more comments, and more cleaning
    const { peripheral, object, name, method, usageId } = opts;
    const embed = new Discord.MessageEmbed()
        .setColor(0xFAA21B)
        .setAuthor('LIKO-12\'s Docs', 'https://github.com/LIKO-12/Extras/raw/master/Icon/icon-square.png', 'https://github.com/LIKO-12/API-Documentation')
        .setTitle(`${object ?? ''}${object ?? peripheral}${method.self ? ':' : '.'}${name}`)
        .setURL(object ? `https://liko-12.github.io/WIP/docs/${`peripherals_${peripheral}_${object}#${object}${name}`.toLowerCase()}` : `https://liko-12.github.io/WIP/docs/${`peripherals_${peripheral}#${peripheral}${name}`.toLowerCase()}`);
    
    let description = `${method.shortDescription ?? ''}${method.longDescription ? '\n' + method.longDescription : ''}`;

    if (method.notes !== undefined) embed.addField('Notes:', '\n> ' + method.notes.map(note => '• ' + note.replace(/\n/g, '\n> ')).join('\n> '));

    if (api.isSingleUsageMethod(method)) { // there is just one usage method
        description += `\n\`\`\`lua\n${generateExampleCode(object ?? peripheral, name, method.self, method.arguments, method.returns)}\n\`\`\``;

        if (method.arguments !== undefined) embed.addField('Arguments:', formatArguments(method.arguments));
        if (method.returns !== undefined) embed.addField('Returns:', formatReturns(method.returns));
    } else if (usageId !== undefined && method.usages[usageId - 1] !== undefined) { // the user selected usage with usage id
        const usage = method.usages[usageId - 1];
        description += `\n\n**${usageId}. ${usage.name}:**`;
        if (usage.shortDescription) description += '\n' + usage.shortDescription;
        if (usage.longDescription) description += '\n' + usage.longDescription;

        description += `\n\`\`\`lua\n${generateExampleCode(object ?? peripheral, name, method.self, usage.arguments, usage.returns)}\n\`\`\``;

        if (usage.notes !== undefined) embed.addField('> ', usage.notes.map(note => '• ' + note.replace(/\n/g, '\n> ')).join('\n> '));
        if (usage.arguments !== undefined) embed.addField('Arguments:', formatArguments(usage.arguments));
        if (usage.returns !== undefined) embed.addField('Returns:', formatReturns(usage.returns));
        if (usage.extra !== undefined) embed.addField('Usage extra information:', usage.extra);
    } else { // if there is multiple usage's and none selected 
        for (let i = 0; i < method.usages.length; i++) {
            const usage = method.usages[i];
            let usageDescription: string = usage.shortDescription ?? '';

            // idk how this code could possibly run.
            // if (usageId === 0 && usage.longDescription) usageDescription += '\n' + usage.longDescription;
            
            usageDescription += `\`\`\`lua\n${generateExampleCode(object ?? peripheral, name, method.self, usage.arguments, usage.returns)}\n\`\`\``;
            if (usage.notes !== undefined) usageDescription += `\n>` + usage.notes.map(note => '• ' + note.replace(/\n/g, '\n> ')).join('\n> ');

            usageDescription = usageDescription.replace(/^\n*/g, ''); //Clear leading new lines.
            embed.addField(`${i+1}. ${usage.name}`, usageDescription);

            if (usageId === 0) {
                if (usage.arguments !== undefined) embed.addField('Arguments:', formatArguments(usage.arguments));
                if (usage.returns !== undefined) embed.addField('Returns:', formatReturns(usage.returns));
                if (usage.extra !== undefined) embed.addField('Usage extra information:', usage.extra);
            }
        }

        if (usageId !== 0) embed.setFooter(`Use '.method ${embed.title} [number]' to view a specific usage's documentation\nUse '.method ${embed.title} 0' to view them all`);
    }

    description?.replace(/^\n*/g, ''); //Clear leading new lines.
    embed.setDescription(description);

    if (method.extra !== undefined) embed.addField('Extra information:', method.extra);

    return embed;
}

/**
 * An object containing all the methods defined in the engine's documentation.
 */
export const methodsIndex: {
    [methodName: string]: {
        peripheral: string,
        object: string | undefined,
        name: string,
        method: api.LuaMethod,
        formatted: string
    }
} = {};

//Build the methods index
for (const peripheralName in api.engine.Peripherals) {
    const peripheral = api.engine.Peripherals[peripheralName];
    if (peripheral.methods) {
        for (const methodName in peripheral.methods) {
            const method = peripheral.methods[methodName];
            const result = { peripheral: peripheralName, object: undefined, name: methodName, method, formatted: `${peripheralName}${method.self ? ':' : '.'}${methodName}` };
            methodsIndex[methodName.toLowerCase()] = result;
            methodsIndex[`${peripheralName}.${methodName}`.toLowerCase()] = result;
            if (method.self) methodsIndex[`${peripheralName}:${methodName}`.toLowerCase()] = result;
        }
    }

    if (peripheral.objects) {
        for (const objectName in peripheral.objects) {
            const object = peripheral.objects[objectName];
            if (object.methods) {
                for (const methodName in object.methods) {
                    const method = object.methods[methodName];
                    const result = { peripheral: peripheralName, object: objectName, name: methodName, method, formatted: `${peripheralName}/${objectName}${method.self ? ':' : '.'}${methodName}` };

                    methodsIndex[`${peripheralName}/${objectName}.${methodName}`.toLowerCase()] = result;
                    if (method.self) methodsIndex[`${peripheralName}/${objectName}:${methodName}`.toLowerCase()] = result;

                    methodsIndex[`${objectName}.${methodName}`.toLowerCase()] = result;
                    if (method.self) methodsIndex[`${objectName}:${methodName}`.toLowerCase()] = result;
                }
            }
        }
    }
}