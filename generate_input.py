import hashlib

from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from zokrates_pycrypto.field import FQ
from zokrates_pycrypto.utils import write_signature_for_zokrates_cli

if __name__ == "__main__":

    # sk = PrivateKey.from_rand()
    # Seeded for debug purpose
    key = FQ(1997011358982923168928344992199991480689546837621580239342656433234255379025)
    sk = PrivateKey(key)

    pk = PublicKey.from_private(sk)

    inputs = [i for i in range(10)]

    path = 'zokrates_inputs.txt'
    keys = [pk.p.x.n, pk.p.y.n, sk.fe.n]
    args = " ".join(map(str, keys)) + " " + " ".join(map(str, inputs))
    print(args)
    with open(path, 'w+') as f:
        f.write(args)