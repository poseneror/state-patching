import {act, renderHook, RenderResult} from "@testing-library/react-hooks";
import useStatePatching, {ApplyPatchParams, ApplyPatchResult, UseStatePatching} from "./useStatePatching";
import {applyPatch, Patch} from "../PatchingSystem/patch-system";
import {ChangeType} from "../ChangesSystem/changes-mapper";


type TestStateItem = {
    title: string,
};
type TestState = TestStateItem[];

class StatePatchingDriver<StateType> {
    private renderResult: RenderResult<UseStatePatching<StateType>>

    constructor(initialState: StateType) {
        const {result} = renderHook(() => useStatePatching(initialState));
        this.renderResult = result;
    }

    setState(statePatch: ApplyPatchParams<StateType>): ApplyPatchResult<StateType> {
        let patchResult: ApplyPatchResult<StateType>;
        const [, patchState] = this.renderResult.current;
        act(() => {
            patchResult = patchState(statePatch);
        })
        return patchResult!;
    }

    getState() {
        const [state] = this.renderResult.current;
        return state;
    }
}



describe('state patching', () => {
    let initialState: TestState;
    let driver: StatePatchingDriver<TestState>;
    let mockPatchesToFirstElementTitle: Patch[];

    beforeEach(() => {
        const initialTitle = 'item-1-title-1';
        const secondTitle = 'item-1-title-2';
        const thirdTitle = 'item-1-title-3';
        mockPatchesToFirstElementTitle = [
            {
                revision: 0,
                changes: [{
                    type: ChangeType.VALUE_UPDATED,
                    path: ['0', 'title'],
                    data: secondTitle,
                }]
            },
            {
                revision: 1,
                changes: [{
                    type: ChangeType.VALUE_UPDATED,
                    path: ['0', 'title'],
                    data: thirdTitle,
                }]
            },
        ]
        initialState = [{title: initialTitle}];
        driver = new StatePatchingDriver(initialState);
    })

    it('returns given initial state', () => {
        expect(driver.getState()).toEqual(initialState);
    });

    describe('set state', () => {
        it('adds an item to the state', () => {
            const newState = applyPatch(initialState, mockPatchesToFirstElementTitle[0]);

            driver.setState(newState);

            expect(driver.getState()).toEqual(newState);
        });

        it('patches the state using a callback', () => {
            const secondState = applyPatch(initialState, mockPatchesToFirstElementTitle[0]);
            const thirdState = applyPatch(secondState, mockPatchesToFirstElementTitle[1]);
            driver.setState(secondState);

            driver.setState((currentState) => {
                expect(currentState).toEqual(secondState);
                return thirdState;
            })

            expect(driver.getState()).toEqual(thirdState);
        })


        describe('undo', () => {
            it('undos given state patch', () => {
                const secondState = applyPatch(initialState, mockPatchesToFirstElementTitle[0]);
                const {undo} = driver.setState(secondState);

                act(() => {
                    undo();
                })

                expect(driver.getState()).toEqual(initialState);
            })

            describe('async operations', () => {
                it('should not undo if value has already changed again', () => {
                    const secondState = applyPatch(initialState, mockPatchesToFirstElementTitle[0]);
                    const thirdState = applyPatch(secondState, mockPatchesToFirstElementTitle[1]);

                    act(() => {
                        const {undo: undoFirst} = driver.setState(secondState);
                        driver.setState(thirdState);
                        undoFirst();
                    })

                    expect(driver.getState()).toEqual(thirdState);
                })
            })
        })
    })
})
