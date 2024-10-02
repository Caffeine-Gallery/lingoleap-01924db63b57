import Array "mo:base/Array";
import Hash "mo:base/Hash";

import Text "mo:base/Text";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor {
  private stable var entries : [(Principal, Text)] = [];
  private var translations : HashMap.HashMap<Principal, Text> = HashMap.fromIter(entries.vals(), 10, Principal.equal, Principal.hash);

  public shared(msg) func setLastTranslation(translation : Text) : async () {
    let caller = msg.caller;
    translations.put(caller, translation);
  };

  public shared query(msg) func getLastTranslation() : async ?Text {
    let caller = msg.caller;
    translations.get(caller)
  };

  system func preupgrade() {
    entries := Iter.toArray(translations.entries());
  };

  system func postupgrade() {
    translations := HashMap.fromIter(entries.vals(), 10, Principal.equal, Principal.hash);
  };
}
