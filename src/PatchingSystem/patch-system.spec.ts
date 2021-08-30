import {applyPatch, Patch} from "./patch-system";
import {ChangeType} from "../ChangesSystem/changes-mapper";

describe('patch system', () => {
    const initialValue = 'initial-value';
    let object: any, arrayObject: any;

    beforeEach(() => {
        object = {
            parent: {
                nestedChild: initialValue,
            },
        };
        arrayObject = {
            childArray: [
                {
                    nestedChild: initialValue,
                },
            ],
        };
    })

    describe('value update', () => {
        it('applies patch to nested value', () => {
            const newValue = 'new-value';
            const patch: Patch = {
                revision: 0,
                changes: [{
                    path: ['parent', 'nestedChild'],
                    type: ChangeType.VALUE_UPDATED,
                    data: newValue,
                }],
            };

            const patchedObject = applyPatch(object, patch);

            expect(patchedObject).toEqual({
                parent: {
                    nestedChild: newValue,
                },
            });
        });
    });

    describe('value deletion', () => {
        it('applies patch to nested value', () => {
            const patch: Patch = {
                revision: 0,
                changes: [{
                    path: ['parent', 'nestedChild'],
                    type: ChangeType.VALUE_DELETED,
                    data: initialValue,
                }],
            };

            const patchedObject = applyPatch(object, patch);

            expect(patchedObject).toEqual({
                parent: {},
            });
        });

        describe('when value is an array item', () => {
            it('applies patch to nested value', () => {
                const patch: Patch = {
                    revision: 0,
                    changes: [{
                        path: ['childArray', '0'],
                        type: ChangeType.VALUE_DELETED,
                        data: initialValue,
                    }],
                };
                const patchedObject = applyPatch(arrayObject, patch);

                expect(patchedObject).toEqual({
                    childArray: [],
                });
            });
        });
    });

    describe('value creation', () => {
        it('applies patch to nested value', () => {
            const patch: Patch = {
                revision: 0,
                changes: [{
                    path: ['parent', 'secondNestedChild'],
                    type: ChangeType.VALUE_CREATED,
                    data: initialValue,
                }],
            };

            const patchedObject = applyPatch(object, patch);

            expect(patchedObject).toEqual({
                parent: {
                    nestedChild: initialValue,
                    secondNestedChild: initialValue,
                },
            });
        });

        describe('when value is an array item', () => {
            it('applies patch to nested value', () => {
                const secondChild = {
                    nestedChild: 'another value'
                }
                const patch: Patch = {
                    revision: 0,
                    changes: [{
                        path: ['childArray', '1'],
                        type: ChangeType.VALUE_CREATED,
                        data: secondChild,
                    }],
                };

                const patchedObject = applyPatch(arrayObject, patch);

                expect(patchedObject).toEqual({
                    childArray: [
                        {
                            nestedChild: initialValue,
                        },
                        secondChild,
                    ],
                });
            });
        });
    });
});
