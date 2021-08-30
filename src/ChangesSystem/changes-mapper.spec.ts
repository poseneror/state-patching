import {Change, ChangeType, mapChanges} from "./changes-mapper";

describe('changes mapper', () => {
    const initialValue = 'initial-value';
    let originalObject: any;

    beforeEach(() => {
        originalObject = {
            parent: {
                nestedChild: initialValue,
            },
        };
    })

    describe('value update', () => {
        it('returns updated values', () => {
            const newValue = 'new-value';
            const mutatedObject = {
                parent: {
                    nestedChild: newValue,
                }
            }
            const expectedChange: Change = {
                path: ['parent', 'nestedChild'],
                type: ChangeType.VALUE_UPDATED,
                data: newValue,
            }

            const changes = mapChanges(originalObject, mutatedObject);

            expect(changes).toEqual(expect.arrayContaining([expectedChange]));
        });
    });

    describe('value creation', () => {
        it('returns updated values', () => {
            const newValue = 'new-value';
            const mutatedObject = {
                parent: {
                    nestedChild: initialValue,
                    nestedSecondChild: newValue,
                }
            }
            const expectedChange: Change = {
                path: ['parent', 'nestedSecondChild'],
                type: ChangeType.VALUE_CREATED,
                data: newValue,
            }

            const changes = mapChanges(originalObject, mutatedObject);

            expect(changes).toEqual(expect.arrayContaining([expectedChange]));
        });
    });

    describe('value deletion', () => {
        it('returns updated values', () => {
            const mutatedObject = {
                parent: {}
            }
            const expectedChange: Change = {
                path: ['parent', 'nestedChild'],
                type: ChangeType.VALUE_DELETED,
                data: initialValue,
            }

            const changes = mapChanges(originalObject, mutatedObject);

            expect(changes).toEqual(expect.arrayContaining([expectedChange]));
        });
    });
});
