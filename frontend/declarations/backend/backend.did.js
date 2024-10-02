export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getLastTranslation' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'setLastTranslation' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
