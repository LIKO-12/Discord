import jsonData from './data/liko-api.json';

/**
 * A standard Lua value type.
 */
export type StandardLuaType = 'number' | 'string' | 'boolean' | 'nil' | 'table' | 'userdata' | 'function';

/**
 * A custom Lua type is an object type, something similar to typescript's interfaces.
 * It's represented by a string array, containing the property names to reach the object definition.
 * For example ['Peripherals', 'GPU', 'objects', 'image'] would be likoAPI.Peripherals.GPU.objects.image;
 */
export type CustomLuaType = ['Peripherals', string, 'objects', string];

/**
 * A single Lua type specified.
 * The custom Lua type can't be specified using this.
 */
export type SimpleLuaType = 'any' | StandardLuaType;

/**
 * Multiple Lua types specified, but could be a single type too.
 * The custom Lua type can only be specified through this.
 */
export type ComplexLuaType = SimpleLuaType | CustomLuaType;

/**
 * Represents a value type.
 */
export type LuaType = SimpleLuaType | ComplexLuaType[];

/**
 * Represents either the category version, or the LIKO-12 version.
 */
export type SubVersion = [major: number, minor: number, patch: number];

/**
 * Represents both the category and LIKO-12 versions.
 */
export type Version = [categoryVersion: SubVersion, likoVersion: SubVersion];

/**
 * A single-line string containing plain text only.
 */
export type PlainString = string;

/**
 * A multi-line string containing markdown formatted text.
 */
export type MarkdownString = string;

/**
 * A documentation entry can be a field, a method or an event.
 */
export interface DocumentationEntry {
    /**
     * The first version which the entry was available since.
     */
    availableSince: Version,

    /**
     * The last version which the entry's usage has been modified.
     */
    lastUpdatedIn: Version,

    /**
    * (Optional) Short description about the entry.
    */
    shortDescription: PlainString | undefined,

    /**
     * (Optional) Long description about the entry.
     */
    longDescription: MarkdownString | undefined,

    /**
     * (Optional) Notes about the method.
     */
    notes: MarkdownString[] | undefined,

    /**
     * (Optional) Extra information about the method.
     */
    extra: MarkdownString | undefined,
}

/**
 * A field property inside a Lua object.
 */
export interface LuaField extends DocumentationEntry {

    /**
     * The type of the field.
     */
    type: LuaType,

    /**
     * (Optional, defaults to false) Whether if this field is protected from writing on (gives error when doing so) or not.
     */
    protected: boolean | undefined
}

export interface LiteralArgument {
    /**
     * The type of the literal argument.
     */
    type: LuaType,

    /**
     * (Optional) Short description about the argument.
     */
    description: PlainString | undefined,

    /**
     * The value of the literal argument, including the double quotes if it's a string.
     */
    default: string
}

export interface VariableArgument {
    /**
     * The name of the argument, '...' for varargs.
     */
    name: string,

    /**
     * The accepted types for the argument.
     * Should not contain the 'nil' type.
     */
    type: LuaType,

    /**
     * (Optional) Short description about the argument.
     */
    description: PlainString | undefined,

    /**
     * (Optional) The default value of the argument, when specified the argument is considered optional.
     * Can be 'nil'.
     */
    default: string | undefined
}

export type Argument = VariableArgument | LiteralArgument

export interface ReturnValue {
    /**
     * The name of the return value, can be a literal value written in a string too.
     */
    name: string,

    /**
     * The possible types of the return value.
     */
    type: LuaType,

    /**
     * (Optional) Short description about the return value.
     */
    description: PlainString | undefined
}

export interface SingleUsageMethod extends DocumentationEntry {
    /**
     * Should ':' be used when calling this method, for object's methods only.
     */
    self: boolean | undefined,

    /**
     * (Optional) The method's arguments.
     */
    arguments: Argument[] | undefined,

    /**
     * (Optional) The method's return values.
     */
    returns: ReturnValue[] | undefined
}

export interface MethodUsage {
    /**
     * The name of the usage variant.
     */
    name: PlainString,

    /**
    * (Optional) Short description about the entry.
    */
    shortDescription: PlainString | undefined,

    /**
     * (Optional) Long description about the entry.
     */
    longDescription: MarkdownString | undefined,

    /**
     * (Optional) Notes about the method.
     */
    notes: MarkdownString[] | undefined,

    /**
     * (Optional) Extra information about the method.
     */
    extra: MarkdownString | undefined,

    /**
     * Should ':' be used when calling this method, for object's methods only.
     */
    self: boolean | undefined,

    /**
     * (Optional) The usage's arguments.
     */
    arguments: Argument[] | undefined,

    /**
     * (Optional) The usage's return values.
     */
    returns: ReturnValue[] | undefined
}

export interface MultiUsageMethod extends DocumentationEntry {
    /**
     * Should ':' be used when calling this method, for object's methods only.
     */
    self: boolean | undefined,

    /**
     * The usages of the method.
     */
    usages: MethodUsage[]
}

export type LuaMethod = SingleUsageMethod | MultiUsageMethod;

export interface LuaObject extends DocumentationEntry {
    /**
     * The fields provided by this object.
     */
    fields: { [fieldName: string]: LuaField } | undefined;

    /**
     * The methods provided by this object.
     */
    methods: { [methodName: string]: LuaMethod } | undefined;

    /**
     * The markdown documents about this object.
     */
    documents: { [documentName: string]: MarkdownString } | undefined;
}

export type EventArgument = ReturnValue;

export interface LuaEvent extends DocumentationEntry {
    /**
     * (Optional) The arguments of the event.
     */
    arguments: EventArgument[] | undefined
}

/**
 * A LIKO-12 peripheral.
 */
export interface Peripheral {
    /**
     * The peripheral version.
     */
    version: SubVersion,

    /**
     * The LIKO-12 version which the peripheral is available since.
     */
    availableSince: SubVersion,

    /**
     * The LIKO-12 version which the peripheral was last updated in.
     */
    lastUpdatedIn: SubVersion,

    /**
     * (Optional) The full/extended peripheral name.
     */
    name: PlainString | undefined,

    /**
     * A short description of the peripheral.
     */
    shortDescription: PlainString,

    /**
     * (Optional) The full description of the peripheral.
     */
    fullDescription: MarkdownString | undefined,

    /**
     * (Optional) The methods provided by the peripheral.
     */
    methods: { [methodName: string]: LuaMethod } | undefined,

    /**
     * (Optional) The objects defined by the pheripheral.
     */
    objects: { [objectName: string]: LuaObject } | undefined,

    /**
     * (Optional) The events triggered by the peripheral.
     */
    events: { [eventName: string]: LuaEvent } | undefined,

    /**
     * (Optional) Extra markdown documents about the peripheral.
     */
    documents: { [documentName: string]: MarkdownString } | undefined
}

interface Documentation {
    /**
     * The version of LIKO-12 being documented.
     */
    engineVersion: SubVersion,

    /**
     * The date of the documentation release, YYYY-MM-DD format.
     */
    revisionDate: string,

    /**
     * The number of the documentation release.
     */
    revisionNumber: number,

    /**
     * The date of the specification implemented.
     */
    specificationDate: string,

    /**
     * A link to the specification implemented.
     */
    specificationLink: string,

    /**
     * The peripherals defined by the documentation.
     */
    Peripherals: { [peripheralShortName: string]: Peripheral }
}

export function isSingleType(type: LuaType): type is SimpleLuaType {
    return !Array.isArray(type);
}

export function isMultipleTypes(type: LuaType): type is ComplexLuaType[] {
    return Array.isArray(type);
}

export function isSimpleType(type: ComplexLuaType): type is SimpleLuaType {
    return !Array.isArray(type);
}

export function isCustomType(type: ComplexLuaType): type is CustomLuaType {
    return Array.isArray(type);
}

export function isLiteralArgument(argument: Argument): argument is LiteralArgument {
    return (argument as VariableArgument).name === undefined;
}

export function isVariableArgument(argument: Argument): argument is VariableArgument {
    return (argument as VariableArgument).name !== undefined;
}

export function isSingleUsageMethod(method: LuaMethod): method is SingleUsageMethod {
    return (method as MultiUsageMethod).usages === undefined;
}

export function isMultiUsageMethod(method: LuaMethod): method is MultiUsageMethod {
    return (method as MultiUsageMethod).usages !== undefined;
}

export const engine = jsonData as unknown as Documentation;