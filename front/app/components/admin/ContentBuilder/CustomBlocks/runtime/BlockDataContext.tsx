import React, { createContext, useContext, useMemo } from 'react';

interface BlockData {
  /**
   * The layout the blocks on this page belong to.
   *
   * It is what a block's query is answered against: with it the answer comes from
   * (or becomes) that layout's stored answer, so a reader is served a picture of a
   * moment rather than running SQL. Without it the query runs live, which only an
   * admin may do.
   */
  layoutId?: string;
  /**
   * A short-lived token permitting this layout's reporting data, set only by the
   * check service's harness. A signed-in admin needs none; a browser with no
   * session cannot read anything without one.
   */
  reportingToken?: string;
}

const Context = createContext<BlockData>({});

interface Props extends BlockData {
  children: React.ReactNode;
}

const BlockDataProvider = ({ layoutId, reportingToken, children }: Props) => {
  const value = useMemo(
    () => ({ layoutId, reportingToken }),
    [layoutId, reportingToken]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useBlockData = () => useContext(Context);

export default BlockDataProvider;
