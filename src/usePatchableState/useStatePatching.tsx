import {useMemo, useState} from 'react'
import copy from 'fast-copy';
import {applyPatch, Patch} from "../PatchingSystem/patch-system";
import {createPatch} from "../ChangesSystem/changes-mapper";

export type ApplyPatchParams<StateType> = StateType | ((currentState: StateType) => StateType)

export type ApplyPatchResult<StateType> = { undo: () => void };
export type ApplyPatch<StateType> = (statePatch: StateType | ((currentState: StateType) => StateType)) => ApplyPatchResult<StateType>

export type  UseStatePatching<StateType> = [StateType, ApplyPatch<StateType>]

function useStatePatching<StateType>(initialState: StateType): UseStatePatching<StateType>  {
    const [state, setState] = useState<StateType>(initialState);
    const appliedPatches: Patch[] = useMemo(() => [], []);


    const generateCurrentState = () => {
        let generatedState = copy(initialState);
        appliedPatches.forEach((patch) => {
            generatedState = applyPatch(generatedState, patch);
        })
        return generatedState;
    }

    const getAppliedState = (applyState: ApplyPatchParams<StateType>, currentState: StateType): StateType => {
        if (typeof applyState === 'function') {
            return (applyState as Function)(copy(currentState));
        } else {
            return applyState;
        }
    }

    const applySetState = (applyState: ApplyPatchParams<StateType>) => {
        const currentState = generateCurrentState();
        const statePatch = getAppliedState(applyState, currentState);
        const patchToApply = createPatch(currentState, statePatch);
        appliedPatches.push(patchToApply);
        const newState = applyPatch(currentState, patchToApply);
        setState(newState);

        const undo = () => {
            appliedPatches.splice(appliedPatches.findIndex(patch => patch.revision === patchToApply.revision), 1);
            const state = generateCurrentState();
            setState(state);
        }

        return {undo}
    }

    return [state, applySetState];
}


export default useStatePatching
